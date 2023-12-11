import test from "node:test";
import { LoginServer } from "./loginserver";
import assert from "node:assert";

test("LoginServer", async (t) => {
  const loginServer = new LoginServer(1115);
  await t.test("start", async (t) => {
    await loginServer.start();
  });
  setImmediate(() => {
    process.exit(0)
  })
});


