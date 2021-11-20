// ======================================================================
//
//   GNU GENERAL PUBLIC LICENSE
//   Version 3, 29 June 2007
//   copyright (c) 2020 - 2021 Quentin Gruber
//   copyright (c) 2021 H1emu community
//
//   https://github.com/QuentinGruber/h1z1-server
//   https://www.npmjs.com/package/h1z1-server
//
//   Based on https://github.com/psemu/soe-network
// ======================================================================

import { EventEmitter } from "events";
import { H1emuProtocol } from "../../../protocols/h1emuprotocol";
import { H1emuClient as H1emuClient } from "./h1emuclient";
import { Worker } from "worker_threads";
import { RemoteInfo } from "dgram";

const debug = require("debug")("H1emuServer");
process.env.isBin && require("../../shared/workers/udpServerWorker.js");

export class H1emuServer extends EventEmitter {
  _serverPort?: number;
  _protocol: any;
  _udpLength: number = 512;
  _clients: any = {};
  _connection: Worker;
  _pingTime: number = 5000; // ms
  _pingTimeout: number = 12000;
  _pingTimer!: NodeJS.Timeout;
  constructor(serverPort?: number) {
    super();
    this._serverPort = serverPort;
    this._protocol = new H1emuProtocol();
    this._connection = new Worker(
      `${__dirname}/../../shared/workers/udpServerWorker.js`,
      {
        workerData: { serverPort: serverPort },
      }
    );
  }

  clientHandler(remote: RemoteInfo, opcode: number): H1emuClient | void {
    let client: H1emuClient;
    const clientId = `${remote.address}:${remote.port}`;
    if (!this._clients[clientId]) {
      // if client doesn't exist yet, only accept sessionrequest or sessionreply
      if (opcode !== 0x01 && opcode !== 0x02) return;
      client = this._clients[clientId] = new H1emuClient(remote);
    } else {
      client = this._clients[clientId];
    }
    return client;
  }

  messageHandler(messageType: string, data: Buffer, client: H1emuClient): void {
    throw new Error("You need to implement messageHandler !");
  }

  connectionHandler(message: any): void {
    const { data: dataUint8, remote } = message;
    const data = Buffer.from(dataUint8);
    const client = this.clientHandler(remote, dataUint8[0]);
    client
      ? this.messageHandler(message.type, data, client)
      : debug(
          `Connection rejected from remote ${remote.address}:${remote.port}`
        );
  }

  start(): void {
    this._connection.on("message", (message) =>
      this.connectionHandler(message)
    );

    this._connection.postMessage({ type: "bind" });
  }

  stop(): void {
    this._connection.postMessage({ type: "close" });
    process.exit(0);
  }

  sendData(client: H1emuClient | undefined, packetName: any, obj: any) {
    // blocks zone from sending packet without open session
    if (!client || (!client.session && packetName !== "SessionRequest")) return;
    const data = this._protocol.pack(packetName, obj);
    this._connection.postMessage({
      type: "sendPacket",
      data: {
        packetData: data,
        port: client.port,
        address: client.address,
      },
    },[data.buffer]);
  }

  ping(client: any) {
    this.sendData(client, "Ping", {});
  }
}

exports.H1emuServer = H1emuServer;
