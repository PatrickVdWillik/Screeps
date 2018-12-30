import { SpawnRequest } from "./SpawnQueue";

export interface ICreepBuilder {
    buildBody(room: Room, spawnRequest: SpawnRequest): BodyPartConstant[];
    createName(spawnRequest: SpawnRequest): string;
}

export class CreepBuilder implements ICreepBuilder {
    public buildBody(room: Room, request: SpawnRequest): BodyPartConstant[] {
        const role = request.role;
        switch (role) {
            case "Miner":
                return this.buildMiner(room, request);
            case "Truck":
                return this.buildTruck(room, request);
        }

        throw new Error("Not implemented.");
    }

    public createName(spawnRequest: SpawnRequest): string {
        let exists = false;
        let name = "";
        do {
            const hash = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
            name = `${spawnRequest.role}_${hash}`;
            exists = Game.creeps[name] !== undefined;
        } while (exists);

        return name;
    }

    private buildMiner(room: Room, request: SpawnRequest): BodyPartConstant[] {
        if (request.details.maxCost >= 300) {
            return [WORK, WORK, MOVE, CARRY];
        }

        return [WORK, MOVE, CARRY];
    }

    private buildTruck(room: Room, request: SpawnRequest): BodyPartConstant[] {
        if (request.details.maxCost >= 300) {
            return [MOVE, CARRY, MOVE, CARRY, MOVE, CARRY];
        }

        if (request.details.maxCost >= 200) {
            return [MOVE, CARRY, MOVE, CARRY];
        }

        return [MOVE, CARRY];
    }
}
