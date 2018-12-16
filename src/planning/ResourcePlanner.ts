import { ISpawnQueue, QueuePriority } from "../SpawnQueue";

export class ResourcePlanner {
    public constructor(private _room: Room, private _buildQueue: ISpawnQueue) {
    }

    public run(): void {
        const myCreeps = _.groupBy(this._room.find(FIND_MY_CREEPS, {
            filter: c => ((<any>c.memory).role === "Miner" || (<any>c.memory).role === "Truck")
        }), (c: Creep) => (<any>c.memory).role);

        if (!_.any(myCreeps["Miner"])) {
            const count = this._buildQueue.getRequestCount("Miner");
            console.log(`Count: ${count}`);
            if (this._buildQueue.getRequestCount("Miner") > 0) {
                return;
            }

            this._buildQueue.push("Miner", this._room.energyAvailable, {}, QueuePriority.Critical);
            return;
        }

        if (!_.any(myCreeps["Truck"])) {
            if (this._buildQueue.getRequestCount("Truck") > 0) {
                return;
            }

            this._buildQueue.push("Truck", this._room.energyAvailable, {}, QueuePriority.Critical);
        }
    }
}
