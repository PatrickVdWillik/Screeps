export class Truck {
    constructor(private _creep: Creep) {
    }

    public run(): void {
        const resources: Resource[] = this._creep.room.find(FIND_DROPPED_RESOURCES);
        const resource = resources[0];

        const result = this._creep.pickup(resource);
        console.log("Pickup returned " + result);
        if (result === OK) return;

        if (result === ERR_NOT_IN_RANGE) {
            this._creep.moveTo(resource);
            (<any>this._creep.memory).target = resource.id;
        }


    }
}
