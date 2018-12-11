export class Truck {
    constructor(private _creep: Creep) {
    }

    public run(): void {
        if ((<any>this._creep.memory).task === undefined) {
            (<any>this._creep.memory).task = "loading";
        }
        
        const resources: Resource[] = this._creep.room.find(FIND_DROPPED_RESOURCES);
        if (resources.length === 0) return;
        
        const resource = resources[0];
        const result = this._creep.pickup(resource);
        if (result === OK) {
            if (_.sum(this._creep.carry) >= this._creep.carryCapacity) {
                (<any>this._creep.memory).task = "delivering";
            }
            
            return;
        }

        if (result === ERR_NOT_IN_RANGE) {
            this._creep.moveTo(resource);
            (<any>this._creep.memory).target = resource.id;
        }
    }
}
