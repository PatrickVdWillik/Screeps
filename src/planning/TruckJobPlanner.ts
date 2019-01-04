export interface Job {
    type: string;
}

export enum TruckJobType {
    PickupResource = "pickupresource",
    DeliverResource = "deliverresource"
}

export enum PickupType {
    Resource = "resource",
    Tombstone = "tombstone",
    Structure = "structure"
}

export interface PickupResourceJob extends Job {
    readonly type: string;

    readonly target: string;
    readonly resourceType: ResourceConstant;
    readonly amount?: number;
    readonly pickupFrom: PickupType;
    readonly nextJob?: Job;
}

export interface DeliverResourceJob extends Job {
    readonly type: string;

    readonly target: string;
    readonly amount?: number;
    readonly nextJob?: Job;
    readonly resourceType: ResourceConstant;
}

export class TruckJobPlanner {
    public constructor(private _room: Room) {
    }

    public findJob(creep: Creep, currentJob?: Job): Job | null {
        const carry = _.sum(creep.carry);
        const isFullyLoaded = carry >= creep.carryCapacity;

        if (carry === 0 || !isFullyLoaded) {
            console.log(`Finding a new job loading for ${creep.name}`);
            return this.findLoadResourceJob(creep, carry);
        } else {
            console.log(`Finding a new delivery job for ${creep.name}`);
            return this.findDeliveryJob(creep);
        }
    }

    public completeJob(creep: Creep, job: Job): Job | null {
        return this.findJob(creep, job);
    }

    public failJob(creep: Creep, job: Job): Job | null {
        return this.findJob(creep, job);
    }

    private findLoadResourceJob(creep: Creep, carry: number): Job | null {
        const findJobFunctions = [
            this.findDroppedResourceJob,
            this.findPickupFromTombstoneJob,
            this.findPickupFromSourceContainerJob
        ];

        return _(findJobFunctions)
            .map(fn => fn.call(this, creep))
            .find(job => job !== null)!;
    }

    private findDroppedResourceJob(creep: Creep): Job | null {
        const drops = this._room.find(FIND_DROPPED_RESOURCES);
        if (!_.isEmpty(drops)) {
            console.log(`There are drops in the room, creep will service ${drops[0]}`);
            const job: PickupResourceJob = {
                type: TruckJobType.PickupResource,
                resourceType: drops[0].resourceType,
                pickupFrom: PickupType.Resource,
                target: drops[0].id
            };

            return job;
        }

        return null;
    }

    private findPickupFromTombstoneJob(creep: Creep): Job | null {
        const tombstones = this._room.find(FIND_TOMBSTONES);
        if (!_.isEmpty(tombstones)) {
            console.log(`There are tombstones in the room, creep will service ${tombstones[0]}`);
            const job: PickupResourceJob = {
                type: TruckJobType.PickupResource,
                pickupFrom: PickupType.Tombstone,
                target: tombstones[0].id,
                resourceType: _.keys(tombstones[0].store)[0] as ResourceConstant
            };

            return job;
        }

        return null;
    }

    private findPickupFromSourceContainerJob(creep: Creep): Job | null {
        const containers = this._room.find(FIND_STRUCTURES, {
            filter: s => {
                if (s.structureType !== STRUCTURE_CONTAINER) return false;
                return s.pos.findInRange(FIND_SOURCES, 1).length > 0;
            }
        });

        if (!_.isEmpty(containers)) {
            const container = _.first(containers);
            const resourceType = RESOURCE_ENERGY;
            const job: PickupResourceJob = {
                type: TruckJobType.PickupResource,
                pickupFrom: PickupType.Structure,
                target: container.id,
                resourceType: resourceType
            };
            return job;
        }

        return null;
    }

    private findDeliveryJob(creep: Creep): Job | null {
        if (creep.carry[RESOURCE_ENERGY] === 0) {
            return null;
        }
        const spawns = this._room.find(FIND_MY_SPAWNS, {
            filter: s => s.energy < s.energyCapacity
        });

        if (!_.isEmpty(spawns)) {
            const job: DeliverResourceJob = {
                type: TruckJobType.DeliverResource,
                target: spawns[0].id,
                resourceType: RESOURCE_ENERGY
            };

            return job;
        }

        return null;
    }
}
