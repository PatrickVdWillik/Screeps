export class Truck implements IRunnable {
    constructor(private _creep: Creep) {
    }

    public run(): void {
        if ((<any>this._creep.memory).task === undefined) {
            if (_.sum(this._creep.carry) >= this._creep.carryCapacity) {
                this.startDelivery();
            } else {
                this.startLoading();
            }
        }

        const currentTask = (<any>this._creep.memory).task;
        if (currentTask === "loading") {
            this.runLoading();
        } else if (currentTask === "delivering") {
            this.runDelivering();
        }
    }

    private startLoading(): void {
        (<any>this._creep.memory).task = "loading";
        (<any>this._creep.memory).target = undefined;
    }

    private startDelivery(): void {
        (<any>this._creep.memory).task = "delivering";
        (<any>this._creep.memory).target = undefined;
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
            (<any>this._creep.memory).target = resource.id;
        } else if (result === ERR_FULL) {
            this.startDelivery();
        } else {
            console.log(`Error picking up resource: ${result}. Resource was ${resource.id} (undefined: ${resource === undefined})`);
        }
    }

    private getResource(): Resource | null {
        if ((<any>this._creep.memory).target) {
            const obj = Game.getObjectById<Resource>((<any>this._creep.memory).target)!;
            if (obj) {
                return obj;
            }

            (<any>this._creep.memory).target = undefined;
        }

        const resources: Resource[] = this._creep.room.find(FIND_DROPPED_RESOURCES);
        if (_.any(resources)) {
            return resources[0];
        }

        return null;
    }

    private runDelivering(): void {
        if (_.sum(this._creep.carry) === 0) {
            this.startLoading();
        }
        const spawn = this.getDeliveryTarget();
        if (!spawn) return;

        const amount = this.determineTransferAmount(spawn! as StructureSpawn);
        if (amount === 0) {
            (<any>this._creep.memory).target = undefined;
        }

        const result = this._creep.transfer(spawn!, RESOURCE_ENERGY, amount);
        if (result === OK) {
            (<any>this._creep.memory).target = undefined;
        } else if (result === ERR_NOT_IN_RANGE) {
            (<any>this._creep.memory).target = spawn.id;
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
        if ((<any>this._creep.memory).target) {
            const target = Game.getObjectById<Structure>((<any>this._creep.memory).target);
            if (target) { return target; }

            (<any>this._creep.memory).target = undefined;
        }

        const spawns = this._creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s: StructureSpawn | StructureExtension) => s.energy < s.energyCapacity
        });

        if (!_.any(spawns)) return null;

        return spawns[0];
    }
}
