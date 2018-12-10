export class Truck {
    constructor(private _creep: Creep) {
    }

    public run(): void {
        const resource = _.first(this._creep.find(FIND_DROPPED_RESOURCES));
        this._creep.memory.target = resource.id;
        console.log(JSON.stringify(this._creep.memory));
    }
}
