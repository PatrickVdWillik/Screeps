interface TruckMemory extends CreepMemory {
    target?: string;
    task: string;
}

export class Truck implements IRunnable {
    constructor(private _creep: Creep) {
    }

    private get memory(): TruckMemory {
        return this._creep.memory as TruckMemory;
    }

    public run(): void {
        if (this.memory.task === undefined) {
            if (_.sum(this._creep.carry) >= this._creep.carryCapacity) {
                this.startDelivery();
            } else {
                this.startLoading();
            }
        }

        const currentTask = this.memory.task;
        if (currentTask === "loading") {
            this.runLoading();
        } else if (currentTask === "delivering") {
            this.runDelivering();
        }
    }

    private startLoading(): void {
        this.memory.task = "loading";
        this.memory.target = undefined;
    }

    private startDelivery(): void {
        this.memory.task = "delivering";
        this.memory.target = undefined;
    }

    private runLoading(): void {
        const resource = this.getResource();
        if (!resource) {
            const currentCarry = _.sum(this._creep.carry);
            if (currentCarry > 0) {
                this.startDelivery();
            }

            return;
        }

        const result = this._creep.pickup(resource);
        if (result === OK) {
            const totalCarry = _.sum(this._creep.carry);
            if (totalCarry + resource.amount >= this._creep.carryCapacity) {
                this.startDelivery();
            }
        } else if (result === ERR_NOT_IN_RANGE) {
            this._creep.moveTo(resource);
            this.memory.target = resource.id;
        } else if (result === ERR_FULL) {
            this.startDelivery();
        } else {
            console.log(`Error picking up resource: ${result}. Resource was ${resource.id} (undefined: ${resource === undefined})`);
        }
    }

    private getResource(): Resource | null {
        if (this.memory.target) {
            const obj = Game.getObjectById<Resource>(this.memory.target)!;
            if (obj) {
                return obj;
            }

            this.memory.target = undefined;
        }

        const resources: Resource[] = this._creep.room.find(FIND_DROPPED_RESOURCES);
        if (_.any(resources)) {
            return resources[0];
        }

        return null;
    }

    private runDelivering(): void {
        const totalCarry = _.sum(this._creep.carry);
        if (totalCarry === 0) {
            this.startLoading();
        }

        const spawn = this.getDeliveryTarget();
        if (!spawn) return;

        const amount = this.determineTransferAmount(spawn! as StructureSpawn);
        if (amount === 0) {
            this.memory.target = undefined;
        }

        const result = this._creep.transfer(spawn!, RESOURCE_ENERGY, amount);
        if (result === OK) {
            this.memory.target = undefined;
            if (totalCarry - amount <= 0) {
                this.startLoading();
            }
        } else if (result === ERR_NOT_IN_RANGE) {
            this.memory.target = spawn.id;
            this._creep.moveTo(spawn);
        } else {
            console.log(`Transfer result is ${result}`);
        }
    }

    private determineTransferAmount(target: StructureSpawn | StructureExtension): number {
        const availableEnergy = this._creep.carry[RESOURCE_ENERGY];
        const availableStorage = target.energyCapacity - target.energy;

        return Math.min(availableEnergy, availableStorage);
    }

    private getDeliveryTarget(): Structure | null {
        if (this.memory.target) {
            const target = Game.getObjectById<Structure>(this.memory.target);
            if (target) { return target; }

            this.memory.target = undefined;
        }

        const spawns = this._creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s: StructureSpawn | StructureExtension) => s.energy < s.energyCapacity
        });

        if (!_.any(spawns)) return null;

        return spawns[0];
    }
}
