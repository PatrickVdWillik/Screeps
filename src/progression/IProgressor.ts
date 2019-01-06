import { ColonyState } from "Colony";

export interface IProgressor {
    readonly shouldProgress: boolean;
    readonly nextColonyState: ColonyState;
}
