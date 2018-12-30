export interface Job {
    type: string;
}

enum JobType {
    PickupResource = "pickupresource",
    DeliverResource = "deliverresource"
}

class PickupResourceJob implements Job {
    readonly type: string = JobType.PickupResource;

    readonly target: string;
    readonly amount?: number;
    readonly nextJob?: Job;
}

class DeliverResourceJob implements Job {
    readonly type: string = JobType.DeliverResource;

    readonly target: string;
    readonly amount?: number;
    readonly nextJob?: Job;
}

export class ResourceJobPlanner {
    public constructor(private _room: Room) {

    }

    public findJob(creep: Creep): Job {

    }
}
