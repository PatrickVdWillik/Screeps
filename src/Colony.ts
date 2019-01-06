import { CreepSpawner } from "CreepSpawner";
import { SpawnQueueMemory } from "SpawnQueue";
import { ResourcePlanner, ResourcePlannerMemory } from "planning/ResourcePlanner";
import { IBaseBuilder } from "baseBuilding/IBaseBuilder";
import { ColonyFactory } from "ColonyFactory";
import { IProgressor } from "progression/IProgressor";

export interface ColonyMemory {
    state: ColonyState;
    room: string;
    mainSpawn: string;
    resourcePlanner: ResourcePlannerMemory;
    spawnQueue: SpawnQueueMemory;
}

export enum ColonyState {
    Hatchling,
    Larva,
    Pupa,
    Mature
}

export interface IColony {
    readonly name: string;
    readonly mainSpawn: StructureSpawn | null;
    readonly creeps: Creep[];
    readonly mainRoom: Room;
}

export class Colony implements IColony {
    private _memory: ColonyMemory;
    private _mainRoom: Room;

    private _creepSpawner: CreepSpawner;
    private _resourcePlanner: ResourcePlanner;
    private _baseBuilder: IBaseBuilder;
    private _colonyProgressor: IProgressor;

    public constructor(_roomName: string) {
        let firstRun = false;
        if (Memory.colonies[_roomName] === undefined) {
            Memory.colonies[_roomName] = {
                resourcePlanner: {},
                spawnQueue: []
            };

            firstRun = true;
        }

        this._memory = Memory.colonies[_roomName];
        this._mainRoom = Game.rooms[_roomName];

        if (firstRun) {
            this.intializeColony();
        }
    }

    public run(): void {
        this.init();

        this._resourcePlanner.run();
        this._baseBuilder.run();

        // Spawner should run last, otherwise spawn requests will be removed from the queue but the creep won't exist yet in the census.
        this._creepSpawner.run();

        this._memory.state = this._colonyProgressor.nextColonyState;
    }

    private intializeColony(): void {
        console.log(`Found a new colony, initializing...`);
        this._memory.state = ColonyState.Hatchling;

        this.checkMainSpawn();
    }

    private checkMainSpawn(): void {
        if (!this._memory.mainSpawn) {
            const spawns = this._mainRoom.find(FIND_MY_SPAWNS);
            const spawn = spawns[0];
            if (spawn) {
                this._memory.mainSpawn = spawn.name;
            }
        }
    }

    private init(): void {
        this.createInstances();
    }

    private createInstances(): void {
        const factory = new ColonyFactory(this, this._memory);

        this._creepSpawner = factory.creepSpawner;
        this._resourcePlanner = factory.resourcePlanner;
        this._baseBuilder = factory.baseBuilder;
        this._colonyProgressor = factory.colonyProgressor;
    }

    public get name(): string {
        return this.mainRoom.name;
    }

    public get mainSpawn(): StructureSpawn | null {
        return this._memory.mainSpawn ? Game.spawns[this._memory.mainSpawn] || null : null;
    }

    public get creeps(): Creep[] {
        return this._mainRoom.find(FIND_MY_CREEPS);
    }

    public get mainRoom(): Room {
        return this._mainRoom;
    }

    public get state(): ColonyState {
        return this._memory.state;
    }
}
