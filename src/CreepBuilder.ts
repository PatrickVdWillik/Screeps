import { SpawnRequest } from "./SpawnQueue";

export interface ICreepBuilder {
    buildBody(spawnRequest: SpawnRequest): BodyPartConstant[];
}

export class CreepBuilder implements ICreepBuilder {
    public buildBody(request: SpawnRequest): BodyPartConstant[] {
        throw new Error("Not implemented.");
    }
}
