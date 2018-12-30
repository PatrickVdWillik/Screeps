import { ErrorMapper } from "./utils/ErrorMapper";
import { CreepSpawner } from "CreepSpawner";
import { SpawnQueue } from "SpawnQueue";
import { CreepBuilder } from "CreepBuilder";
import { ResourcePlanner } from "planning/ResourcePlanner";
import { RoleFactory } from "roles/RoleFactory";

export const loop = ErrorMapper.wrapLoop(() => {
  if (Memory.spawnQueue === undefined) {
    Memory.spawnQueue = {};
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    if (creep.spawning) continue;

    const role = RoleFactory.create(creep);
    role.run();
  }

  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];

    if (Memory.spawnQueue[roomName] === undefined) {
      Memory.spawnQueue[roomName] = [];
    }

    if (!(<any>room.memory).mainSpawn) {
      const spawns = room.find(FIND_MY_SPAWNS);
      const spawn = spawns[0];
      if (spawn) {
        (<any>room.memory).mainSpawn = spawn.name;
      }
    }

    const spawnQueue = new SpawnQueue(Memory.spawnQueue[roomName]);
    const bodyBuilder = new CreepBuilder();
    const creepSpawner = new CreepSpawner(room, spawnQueue, bodyBuilder);
    const resourcePlanner = new ResourcePlanner(room, spawnQueue);

    creepSpawner.run();
    resourcePlanner.run();
  }

});
