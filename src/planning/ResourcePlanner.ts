import { ISpawnQueue, QueuePriority } from "../SpawnQueue";

enum SpawnRole {
    Nothing,
    Miner,
    Truck
}

interface SpawnNeeds {
    readonly role: SpawnRole;
    readonly size?: number;
    readonly target?: string;
}

interface ResourcePlannerMemory {
    sources: string[];
    mainSpawn: string;
}

export class ResourcePlanner {
    private _creeps: Record<string, Creep[]>;
    private _hasMiner: boolean;
    private _hasTruck: boolean;
    private _memory: ResourcePlannerMemory;
    
    public constructor(private _room: Room, private _buildQueue: ISpawnQueue) {
    }

    public run(): void {
        this.init();
        
        const spawnNeed = this.whichRoleShouldBeSpawned();
        if (spawnNeed.role === SpawnRole.Nothing) return;
        
        switch (spawnNeed.role) {
            case SpawnRole.Miner:
                this.spawnMiner(spawnNeed);
                break;
            case SpawnRole.Truck:
                this.spawnTruck(spawnNeed);
                break;
        }
    }
    
    private init(): void {
        if ((<any>this._room.memory).resourcePlanner) return;
        
        const spawnName = (<any>this._room.memory).mainSpawn;
        const spawn = Game.spawns[spawnName];
        const sources = _.sortBy(this._room.find(FIND_SOURCES), s => spawn.pos.getRangeTo(s));
        this._memory = {
            mainSpawn: spawnName,
            sources = sources.map(s => s.id)
        };
        
        (<any>this._room.memory).resourcePlanner = this._memory;
    }
    
    private whichRoleShouldBeSpawned(): SpawnNeeds {
        const maxMinerWorkCount: number = (SOURCE_ENERGY_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME) + 1;
        
        this._creeps = _.groupBy(this._room.find(FIND_MY_CREEPS, {
            filter: c => ((<any>c.memory).role === "Miner" || (<any>c.memory).role === "Truck")
        }), (c: Creep) => (<any>c.memory).role);

        this._hasMiner = _.any(this._creeps["Miner"]);
        this._hasTruck = _.any(this._creeps["Truck"]);
        
        if (!this._hasMiner) {
            return ({
                role: SpawnRole.Miner,
                size: maxMinerWorkCount;
            });
        }
        
        if (!this._hasTruck) {
            return ({
                role: SpawnRole.Truck,
            });
        }

        
        const minersBySourceId = _.groupBy(this._creeps["Miner"], c => (<any>c.memory).target);
        const sources = this.room.find(FIND_SOURCES);
        
        
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
