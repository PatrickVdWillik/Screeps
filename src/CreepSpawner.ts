import { ISpawnQueue } from './SpawnQueue';
import { ICreepBuilder } from './CreepBuilder';

export class CreepSpawner {
    constructor(private _room: Room, private _queue: ISpawnQueue, private _creepBuilder: ICreepBuilder) { }

    public run(): void {
        if (this._queue.length === 0) return;

        const spawns = this._room.find(FIND_MY_SPAWNS, {
            filter: s => s.spawning === null
        });

        if (spawns.length === 0) return;

        const spawn = _.first(spawns);
        const request = this._queue.peek()!;

        let body = request.body;
        if (!body) {
            body = this._creepBuilder.buildBody(this._room, request);
        }

        const result = spawn.spawnCreep(body!, "Creep", {
            memory: { role: request.role } as CreepMemory
        });

        if (result === OK) {
            this._queue.completeRequest();
        }
    }
}
