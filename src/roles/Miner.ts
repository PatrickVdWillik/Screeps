export class Miner {
    constructor(private _creep: Creep) {
    }

    public run(): void {
        const source = Game.getObjectById<Source>((<any>this._creep.memory).source)!;
        if (this._creep.harvest(source) === ERR_NOT_IN_RANGE) {
            this._creep.moveTo(source);
        }
    }
}
