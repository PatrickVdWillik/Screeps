import { IColony, ColonyMemory } from "Colony";
import { HatchlingProgressor } from "progression/HatchlingProgressor";
import { IProgressor } from "progression/IProgressor";
import { IBaseBuilder } from "baseBuilding/IBaseBuilder";
import { HatchlingBuilder } from "baseBuilding/HatchingBuilder";
import { ResourcePlanner } from "planning/ResourcePlanner";
import { SpawnQueue } from "SpawnQueue";
import { ICreepBuilder, CreepBuilder } from "CreepBuilder";
import { CreepSpawner } from "CreepSpawner";

export class ColonyFactory {
    private _spawnQueue: SpawnQueue;
    private _bodyBuilder: ICreepBuilder = new CreepBuilder();

    public constructor(private _colony: IColony, private _colonyMemory: ColonyMemory) { }

    public get baseBuilder(): IBaseBuilder {
        return new HatchlingBuilder(this._colony);
    }

    public get colonyProgressor(): IProgressor {
        return new HatchlingProgressor(this._colony, this.baseBuilder);
    }

    public get resourcePlanner(): ResourcePlanner {
        return new ResourcePlanner(this._colony, this.spawnQueue, this._colonyMemory.resourcePlanner);
    }

    public get spawnQueue(): SpawnQueue {
        if (!this._spawnQueue) {
            this._spawnQueue = new SpawnQueue(this._colonyMemory.spawnQueue);
        }

        return this._spawnQueue;
    }

    public get bodyBuilder(): ICreepBuilder {
        return this._bodyBuilder;
    }

    public get creepSpawner(): CreepSpawner {
        return new CreepSpawner(this._colony.mainRoom, this.spawnQueue, this._bodyBuilder);
    }
}
