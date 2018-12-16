import { ISpawnQueue, QueuePriority } from "../SpawnQueue";

export class ResourcePlanner {
    private _creeps: Record<string, Creep[]>;
    public constructor(private _room: Room, private _buildQueue: ISpawnQueue) {
    }

    public run(): void {
        this._creeps = _.groupBy(this._room.find(FIND_MY_CREEPS, {
            filter: c => ((<any>c.memory).role === "Miner" || (<any>c.memory).role === "Truck")
        }), (c: Creep) => (<any>c.memory).role);

        if (!_.any(this._creeps["Miner"])) {
            if (this.spawnEmergencyMiner()) {
                return;
            }
        }

        if (!_.any(this._creeps["Truck"])) {
            if (this.spawnEmergencyTruck()) {
                return;
            }
        }
    }

    private spawnEmergencyMiner(): boolean {
        if (this._buildQueue.getRequestCount("Miner") > 0) {
            return false;
        }

        const minMiner = this.getMinimumMinerBody();
        const minCost = this.getBodyCost(minMiner);
        console.log(`Min cost: ${minCost}, energy in room: ${this._room.energyAvailable}`);

        const maxCost = Math.max(minCost, this._room.energyAvailable);
        this._buildQueue.push("Miner", { maxCost: maxCost }, QueuePriority.Critical);
        return true;
    }

    private spawnEmergencyTruck(): boolean {
        if (this._buildQueue.getRequestCount("Truck") > 0) {
            return false;
        }

        this._buildQueue.push("Truck", { maxCost: this._room.energyAvailable }, QueuePriority.Critical);
        return true;
    }

    private getMinimumMinerBody(): BodyPartConstant[] {
        return [WORK, MOVE, CARRY];
    }

    private getBodyCost(body: BodyPartConstant[]): number {
        return _.sum(body, (part) => BODYPART_COST[part]);
    }
}
