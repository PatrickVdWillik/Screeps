import { ErrorMapper } from "./utils/ErrorMapper";

import { RoleFactory } from "roles/RoleFactory";
import { Colony } from "Colony";

export const loop = ErrorMapper.wrapLoop(() => {
  if (Memory.colonies === undefined) {
    initialize();
  }

  // Automatically delete memory of missing creeps
  // TODO: Merge this with the creation of the census
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  buildCensus();

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    if (creep.spawning) continue;

    const role = RoleFactory.create(creep);
    role.run();
  }

  for (const colonyName in Memory.colonies) {
    const colony = new Colony(colonyName);
    colony.run();
  }

});

function initialize(): void {
  console.log(`Initializing colonies...`);
  Memory.colonies = {};

  for (const name in Game.rooms) {
    const room = Game.rooms[name];
    if (room.find(FIND_MY_SPAWNS).length > 0) {
      const colony = new Colony(name);
      colony.run();
    }
  }
}

function buildCensus(): void {
  const census: Record<string, Creep[]> = {};

  for (const name in Game.creeps) {
    if (!(name in Game.creeps)) {
      // TODO: Implement a proper death routine
      continue;
    }

    const creep = Game.creeps[name];
    const key = `${creep.room.name}_${creep.memory.role}`;
    const room = creep.room.name;

    if (!census[key]) {
      census[key] = [creep];
    } else {
      census[key].push(creep);
    }

    if (!census[room]) {
      census[room] = [creep];
    } else {
      census[room].push(creep);
    }
  }

  // @ts-ignore
  global.census = census;
}
