import { TruckJobPlanner, TruckJobType, PickupType, Job, PickupResourceJob, DeliverResourceJob } from "planning/TruckJobPlanner";

interface TruckMemory extends CreepMemory {
    target?: string;
    job: Job | null;
}

export class Truck implements IRunnable {
    private _jobPlanner: TruckJobPlanner;

    constructor(private _creep: Creep) {
        if (_creep.room === undefined) {
            throw new Error(`Creep ${_creep.name} doesn't have a room`);
        }

        this._jobPlanner = new TruckJobPlanner(_creep.room);
    }

    private get memory(): TruckMemory {
        return this._creep.memory as TruckMemory;
    }

    public run(): void {
        if (!this.memory.job) {
            if (!this.findNewJob()) return;
        }

        const job = this.memory.job!;
        if (job.type === TruckJobType.PickupResource) {
            this.load();
        } else if (job.type === TruckJobType.DeliverResource) {
            this.deliver();
        }
    }

    private findNewJob(): boolean {
        const job = this._jobPlanner.findJob(this._creep, this.memory.job!);
        if (job) {
            this.memory.job = job;
        }

        return job !== null;
    }

    private get currentJob(): Job | null {
        return this.memory.job || null;
    }

    private load(): void {
        const job = this.currentJob as PickupResourceJob;
        const target = Game.getObjectById(job.target);
        if (!target) {
            this.failJob();
            return;
        }

        let result: ScreepsReturnCode;
        switch (job.pickupFrom) {
            case PickupType.Resource:
                result = this._creep.pickup(target as Resource);
                break;
            case PickupType.Tombstone:
                result = this._creep.withdraw(target as Tombstone, job.resourceType);
                break;
            case PickupType.Structure:
                result = this._creep.withdraw(target as Structure, job.resourceType);
                break;
            default:
                result = ERR_INVALID_ARGS;
        }

        if (result === ERR_NOT_IN_RANGE) {
            this._creep.moveTo(target as { pos: RoomPosition });
        } else if (result === OK || result === ERR_FULL) {
            this.completeJob();
        } else {
            console.log(`${this._creep.name}: Error (${result}) collecting resource from ${target}. Job descriptor: ${JSON.stringify(job)}`);
            // TODO: Should cancel job?
        }
    }

    private deliver(): void {
        const job = this.memory.job as DeliverResourceJob;
        const target = Game.getObjectById(job.target);
        if (!target) {
            console.log(`Cannot find deliver target for job: ${JSON.stringify(job)}`);
            this.failJob();
            return;
        }

        let amount = job.amount || this.determineTransferAmount(target as StructureSpawn);
        const result = this._creep.transfer(target as Structure, job.resourceType, amount);
        if (result === ERR_NOT_IN_RANGE) {
            this._creep.moveTo(target as Structure);
        } else if (result === OK) {
            this.completeJob();
        }
    }

    private determineTransferAmount(target: StructureSpawn | StructureExtension): number {
        const availableEnergy = this._creep.carry[RESOURCE_ENERGY];
        const availableStorage = target.energyCapacity - target.energy;

        return Math.min(availableEnergy, availableStorage);
    }

    private completeJob(): void {
        this.memory.job = this._jobPlanner.completeJob(this._creep, this.memory.job!);
    }

    private failJob(): void {
        this.memory.job = this._jobPlanner.failJob(this._creep, this.memory.job!);
    }
}
