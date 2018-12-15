import { ISpawnQueue, QueuePriority } from "../SpawnQueue";

export class ResourcePlanner {
    public constructor(private _room: Room, private _buildQueue: ISpawnQueue) {
    }

    public run(): void {
        const myCreeps = _.groupBy(this._room.find(FIND_MY_CREEPS, {
            filter: c => c.memory.role === "Miner" || c.memory.role === "Truck"
        }), c => c.memory.role);

        if (!_.any(myCreeps["Miner"])) {
            this._buildQueue.push("Miner", this._room.energyAvailable, {}, QueuePriority.Critical);
        }
    }
}
