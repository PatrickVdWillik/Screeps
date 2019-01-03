import { ResourceJobPlanner, TruckJobType, PickupType, Job, PickupResourceJob, DeliverResourceJob } from "planning/ResourceJobPlanner";

interface TruckMemory extends CreepMemory {
    target?: string;
    job: Job;
}

export class Truck implements IRunnable {
    private _jobPlanner: ResourceJobPlanner;
    
    constructor(private _creep: Creep) {
        this._jobPlanner = new ResourceJobPlanner(_creep.room);
    }

    private get memory(): TruckMemory {
        return this._creep.memory as TruckMemory;
    }

    public run(): void {
        if (!this.memory.job) {
            if (!this.findNewJob()) return;
        }
        
        const job = this.memory.job;
        if (job.type === TruckJobType.PickupResource) {
            this.load();
        } else if (job === TruckJobType.DeliverResource) {
            this.deliver();
        }
//        if (this.memory.task === undefined) {
//            if (_.sum(this._creep.carry) >= this._creep.carryCapacity) {
//                this.startDelivery();
//            } else {
//                this.startLoading();
//            }
//        }
//
//        const currentTask = this.memory.task;
//        if (currentTask === "loading") {
//            this.runLoading();
//        } else if (currentTask === "delivering") {
//            this.runDelivering();
//        }
    }
    
    private findNewJob(): boolean {
        const job = this._jobPlanner.findJob(this._creep, this.memory.job);
        if (job) {
            this.memory.job = job;
        }
        
        return job !== null;
    }

//    private startLoading(): void {
//        this.memory.task = "loading";
//        this.memory.target = undefined;
//    }
//
//    private startDelivery(): void {
//        this.memory.task = "delivering";
//        this.memory.target = undefined;
//    }

    private get currentJob(): Job | null {
        return this.memory.job || null;
    }
    
    private load(): void {
        const job = this.currentJob;
        const target = Game.getObjectById(job.target);
        if (!target) {
            this.memory.job = this._jobPlanner.jobFailed(this._creep, job);
            return;
        }
        
        const result: any; // TODO: CreepActionResultCode ?
        switch (job.pickupFrom) {
            case PickupType.Resource:
                result = this._creep.pickup(target as Resource);
                break;
            case PickupType.Tombstone:
                result = this._creep.withdraw(target as Tombstone, job.resourceType);
                break;
            case PickupType.Structure:
                result = this._creep.withdraw(target, job.resourceType);
                break;
        }
        
        if (result === ERR_NOT_IN_RANGE) {
            this._creep.moveTo(target);
        } else if (result === OK) {
            this.completeJob();
        } else {
            console.log(`${this._creep.name}: Error collecting resource from ${target}. Job descriptor: ${JSON.stringify(job)}`);
            // TODO: Should cancel job?
        }
    }

//    private getResource(): Resource | null {
//        if (this.memory.target) {
//            const obj = Game.getObjectById<Resource>(this.memory.target)!;
//            if (obj) {
//                return obj;
//            }
//
//            this.memory.target = undefined;
//        }
//
//        const resources: Resource[] = this._creep.room.find(FIND_DROPPED_RESOURCES);
//        if (_.any(resources)) {
//            return resources[0];
//        }
//
//        return null;
//    }

    private deliver(): void {
        const job = this.memory.job as DeliverResourceJob;
        const target = Game.getObjectById(job.target);
        if (!target) {
            console.log(`Cannot find deliver target for job: ${JSON.stringify(job)}`);
            this.memory.job = this._jobPlanner.jobFailed(this._creep, job);
            return;
        }
        
        let amount = job.amount || this.determineTransferAmount(target as StructureSpawn);
        const result = this._creep.transfer(target, job.resourceType, amount);
        if (result === ERR_NOT_IN_RANGE) {
            this._creep.moveTo(target);
        } else if (result === OK) {
            this.completeJob();
        }
    }

//        const totalCarry = _.sum(this._creep.carry);
//        if (totalCarry === 0) {
//            this.startLoading();
//        }
//
//        const spawn = this.getDeliveryTarget();
//        if (!spawn) return;
//
//        const amount = this.determineTransferAmount(spawn! as StructureSpawn);
//        if (amount === 0) {
//            this.memory.target = undefined;
//        }
//
//        const result = this._creep.transfer(spawn!, RESOURCE_ENERGY, amount);
//        if (result === OK) {
//            this.memory.target = undefined;
//            if (totalCarry - amount <= 0) {
//                this.startLoading();
//            }
//        } else if (result === ERR_NOT_IN_RANGE) {
//            this.memory.target = spawn.id;
//            this._creep.moveTo(spawn);
//        } else {
//            console.log(`Transfer result is ${result}`);
//        }
//    }

    private determineTransferAmount(target: StructureSpawn | StructureExtension): number {
        const availableEnergy = this._creep.carry[RESOURCE_ENERGY];
        const availableStorage = target.energyCapacity - target.energy;

        return Math.min(availableEnergy, availableStorage);
    }
    
    private completeJob(): {
        this.memory.job = this._jobPlanner.completeJob(this._creep, this.memory.job);
    }

//    private getDeliveryTarget(): Structure | null {
//        if (this.memory.target) {
//            const target = Game.getObjectById<Structure>(this.memory.target);
//            if (target) { return target; }
//
//            this.memory.target = undefined;
//        }
//
//        const spawns = this._creep.room.find(FIND_MY_STRUCTURES, {
//            filter: (s: StructureSpawn | StructureExtension) => s.energy < s.energyCapacity
//        });
//
//        if (!_.any(spawns)) return null;
//
//        return spawns[0];
//    }
}
