import { IProgressor } from "./IProgressor";
import { ColonyState, IColony } from "Colony";

export class LarvaProgressor implements IProgressor {
    public constructor(private _colony: IColony) {
    }

    public get shouldProgress(): boolean {
        return false;
    }

    public get nextColonyState(): ColonyState {
        return ColonyState.Larva;
    }
}
