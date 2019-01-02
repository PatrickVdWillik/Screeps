interface MinerMemory extends CreepMemory {
    target: string;
    task: string;
    container?: string;
    link?: string;
    workParts: number;
}

enum MinerTasks {
    Mine = "mine",
    BuildContainer = "build",
    RepairContainer = "repair"
}

export class Miner implements IRunnable {
    private _container: StructureContainer | ConstructionSite;
    private _source: Source;

    constructor(private _creep: Creep) {
    }

    public run(): void {
        if (!this.init()) return;

        if (_.sum(this._creep.carry) === this._creep.carryCapacity) {
            if (this.container) {
                if (this.container instanceof StructureContainer) {
                    if (this.container.hits < this.container.hitsMax) {
                        this.memory.task = MinerTasks.RepairContainer;
                    } else {
                        this._creep.transfer(this.container, RESOURCE_ENERGY);
                    }
                } else {
                    this.memory.task = MinerTasks.BuildContainer;
                }
            }
        }

        switch (this.memory.task) {
            case MinerTasks.Mine:
                this.mine();
                break;

            case MinerTasks.BuildContainer:
                this.buildContainer();
                break;

            case MinerTasks.RepairContainer:
                this.repairContainer();
                break;
        }
    }

    private init(): boolean {
        if (!this.memory.task) {
            this.memory.task = MinerTasks.Mine;
        }

        if (!this.memory.workParts) {
            this.memory.workParts = this._creep.getActiveBodyparts(WORK);
        }

        if (!this.source) {
            if (Game.time % 5 === 0) {
                console.log(`${this._creep.name} (miner) has no assigned source.`);
            }

            return false;
        }

        if (!this.memory.container) {
            this.findContainer();
        }

        return true;
    }

    private get memory(): MinerMemory {
        return this._creep.memory as MinerMemory;
    }

    private get source(): Source {
        if (this._source) return this._source;

        this._source = Game.getObjectById<Source>(this.memory.target)!;
        return this._source;
    }

    private get container(): StructureContainer | ConstructionSite {
        if (this._container) return this._container;

        this._container = Game.getObjectById(this.memory.container!)! as StructureContainer | ConstructionSite;
        if (!this._container) {
            console.log(`Stored container no longer exists, forgetting: ${this.memory.container!}`);
            this.memory.container = undefined;
        }
        return this._container;
    }

    private findContainer(): void {
        const containers = this.source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType === STRUCTURE_CONTAINER
        });

        if (!_.isEmpty(containers)) {
            console.log(`Found container: ${containers[0]}`);
            this.memory.container = containers[0].id;
            return;
        }

        const sites = this._creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
            filter: s => s.structureType === STRUCTURE_CONTAINER
        });

        if (!_.isEmpty(sites)) {
            console.log(`Found construction site: ${sites[0]}`);
            this.memory.container = sites[0].id;
        }
    }

    // TODO: Re-factor a bit so it transfers only when already full
    private mine(): void {
        const result = this._creep.harvest(this.source);
        if (result === ERR_NOT_IN_RANGE) {
            this._creep.moveTo(this.source);
        }
    }

    private buildContainer(): void {
        if (this._creep.carry[RESOURCE_ENERGY] === 0) {
            this.memory.task = MinerTasks.Mine;
            this.mine();
            return;
        }

        const result = this._creep.build(this.container as ConstructionSite);
        if (result === ERR_INVALID_TARGET) {
            this.memory.task = MinerTasks.Mine;
        } else if (result !== OK) {
            console.log(`${this._creep.name}: Error building container ${this.container}: ${result}`);
        }
    }

    private repairContainer(): void {
        const container = this.container as StructureContainer;
        if (this._creep.carry[RESOURCE_ENERGY] === 0 || container.hits === container.hitsMax) {
            this.memory.task = MinerTasks.Mine;
            this.mine();
            return;
        }

        const result = this._creep.repair(container);
        if (result !== OK) {
            console.log(`${this._creep.name}: Error repairing ${this.container}`);
        }
    }
}
