import { SpawnRequest } from "./SpawnQueue";

export interface ICreepBuilder {
    buildBody(room: Room, spawnRequest: SpawnRequest): BodyPartConstant[];
}

export class CreepBuilder implements ICreepBuilder {
    public buildBody(room: Room, request: SpawnRequest): BodyPartConstant[] {
        throw new Error("Not implemented.");
    }
}
