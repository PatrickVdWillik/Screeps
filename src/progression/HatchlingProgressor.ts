import { IBaseBuilder } from "baseBuilding/IBaseBuilder";
import { ColonyState, IColony } from "Colony";
import { IProgressor } from "./IProgressor";

export class HatchlingProgressor implements IProgressor {
    constructor(private _colony: IColony, private _baseBuilder: IBaseBuilder) {
    }

    public get shouldProgress(): boolean {
        return this._baseBuilder.isComplete;
    }

    public get nextColonyState(): ColonyState {
        if (!this.shouldProgress) {
            return ColonyState.Hatchling;
        }

        console.log(`Progressing colony ${this._colony.name} into Larva stage`);
        return ColonyState.Larva;
    }
}
