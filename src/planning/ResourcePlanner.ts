import { ISpawnQueue, QueuePriority } from "../SpawnQueue";
import { IColony } from "Colony";

enum SpawnRole {
    Nothing,
    Miner,
    Truck
}

interface SpawnNeeds {
    readonly role: SpawnRole;
    readonly size?: number;
    readonly target?: string;
    readonly emergency?: boolean;
}

export interface ResourcePlannerMemory {
    sources: { id: string, path: number }[];
}

export class ResourcePlanner {
    private _creeps: Record<string, Creep[]>;
    private _hasMiner: boolean;
    private _hasTruck: boolean;

    public constructor(private _colony: IColony, private _buildQueue: ISpawnQueue, private _memory: ResourcePlannerMemory) {
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
        if (this._memory.sources) {
            return;
        }

        const spawn = this._colony.mainSpawn!;
        let sources = this._colony.mainRoom.find(FIND_SOURCES);
        console.log(`Found sources: ${sources}`);
        console.log(`Found spawn: ${spawn} (${spawn.name})`);
        sources = _.sortBy(sources, s => spawn.pos.getRangeTo(s));

        _.extend(this._memory, {
            sources: sources.map(s => ({
                id: s.id,
                path: PathFinder.search(spawn.pos, { pos: s.pos, range: 1 }).cost
            }))
        });
    }

    private whichRoleShouldBeSpawned(): SpawnNeeds {
        const maxMinerWorkCount: number = (SOURCE_ENERGY_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME) + 1;

        this._creeps = {
            "Miner": global.census[`${this._colony.name}_Miner`] || [],
            "Truck": global.census[`${this._colony.name}_Truck`] || []
        }

        this._hasMiner = _.any(this._creeps["Miner"]);
        this._hasTruck = _.any(this._creeps["Truck"]);
        const queuedMiners = this._buildQueue.getRequestCount("Miner");
        const queuedTrucks = this._buildQueue.getRequestCount("Truck");

        if (queuedMiners > 0 || queuedTrucks > 0) {
            return ({
                role: SpawnRole.Nothing
            });
        }

        //console.log(`Has miner: ${this._hasMiner}, has truck: ${this._hasTruck}, nothing in build queue`);

        if (!this._hasMiner) {
            return ({
                role: SpawnRole.Miner,
                size: maxMinerWorkCount,
                emergency: true,
                target: this._memory.sources[0].id
            });
        }

        if (!this._hasTruck) {
            return ({
                role: SpawnRole.Truck,
                emergency: true
            });
        }

        const totalWork = _.sum(this._creeps["Miner"], c => _.sum(c.body, p => p.type === WORK ? 1 : 0));
        const totalCarry = _.sum(this._creeps["Truck"], c => _.sum(c.body, p => p.type === CARRY ? 1 : 0));
        const totalDistance = _.sum(this._memory.sources, s => s.path);
        const totalProductionPerTick = totalWork * HARVEST_POWER;
        const totalCarryPerTick = totalCarry * CARRY_CAPACITY / totalDistance;
        const productionRate = (totalWork * HARVEST_POWER) / (this._memory.sources.length * maxMinerWorkCount * HARVEST_POWER);

        //console.log(`Production rate: ${totalProductionPerTick}, total transport: ${totalCarryPerTick}`);
        if (totalProductionPerTick > totalCarryPerTick) {
            return ({
                role: SpawnRole.Truck
            });
        } else if (productionRate < 1.0 && totalProductionPerTick < totalCarryPerTick) {
            const minersBySourceId = _.groupBy(this._creeps["Miner"], c => (<any>c.memory).target);
            const sources = this._memory.sources.map(src => Game.getObjectById<Source>(src.id)!);

            for (var source of sources) {
                let work = 0;
                if (minersBySourceId[source.id]) {
                    work = _.sum(minersBySourceId[source.id], c => _.sum(c.body, p => p.type === WORK ? 1 : 0));
                }

                if (work < maxMinerWorkCount) {
                    return ({
                        role: SpawnRole.Miner,
                        size: maxMinerWorkCount,
                        target: source.id
                    });
                }
            }
        }

        return ({
            role: SpawnRole.Nothing
        });
    }

    private spawnMiner(need: SpawnNeeds): boolean {
        const minMiner = this.getMinimumMinerBody();
        const minCost = this.getBodyCost(minMiner);
        let maxCost = 0;

        if (need.emergency) {
            maxCost = Math.max(minCost, this._colony.mainRoom.energyAvailable);
        } else {
            maxCost = this._colony.mainRoom.energyCapacityAvailable;
        }

        const memory: any = {};
        if (need.target) {
            memory.target = need.target;
        }
        this._buildQueue.push("Miner", { maxCost: maxCost, work: need.size, memory: memory }, need.emergency ? QueuePriority.Critical : QueuePriority.Normal);
        return true;
    }

    private spawnTruck(need: SpawnNeeds): boolean {
        let maxCost = 0;
        if (need.emergency) {
            maxCost = Math.max(100, this._colony.mainRoom.energyAvailable);
        } else {
            maxCost = this._colony.mainRoom.energyCapacityAvailable;
        }

        this._buildQueue.push("Truck", { maxCost: maxCost }, QueuePriority.Critical);
        return true;
    }

    private getMinimumMinerBody(): BodyPartConstant[] {
        return [WORK, MOVE, CARRY];
    }

    private getBodyCost(body: BodyPartConstant[]): number {
        return _.sum(body, (part) => BODYPART_COST[part]);
    }
}
