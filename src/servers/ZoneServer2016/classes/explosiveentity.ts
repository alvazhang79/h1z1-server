// ======================================================================
//
//   GNU GENERAL PUBLIC LICENSE
//   Version 3, 29 June 2007
//   copyright (C) 2020 - 2021 Quentin Gruber
//   copyright (C) 2021 - 2022 H1emu community
//
//   https://github.com/QuentinGruber/h1z1-server
//   https://www.npmjs.com/package/h1z1-server
//
//   Based on https://github.com/psemu/soe-network
// ======================================================================

import { ZoneServer2016 } from "../zoneserver";
import { BaseLightweightCharacter } from "./baselightweightcharacter";
import { ZoneClient2016 } from "./zoneclient";

export class ExplosiveEntity extends BaseLightweightCharacter {
  isIED = false;
  mineTimer?: NodeJS.Timeout;
  npcRenderDistance = 300;
  constructor(
    characterId: string,
    transientId: number,
    actorModelId: number,
    position: Float32Array,
    rotation: Float32Array,
    isIED: boolean = false
  ) {
    super(characterId, transientId, actorModelId, position, rotation);
    this.isIED = isIED;
  }

  OnProjectileHit(
    server: ZoneServer2016,
    client: ZoneClient2016,
    damage: number
  ) {
    server.detonateExplosive(this);
  }
}
