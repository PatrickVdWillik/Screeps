import * as TypeMoq from "typemoq";
import * as _ from "lodash";
import { IMock, Mock, It, Times } from "typemoq";
import { AbstractBuilder } from "./AbstractBuilder";
import { SpawnBuilder } from "./SpawnBuilder";
import { assert } from "chai";

export class RoomBuilder extends AbstractBuilder<Room> {
    private _memory: any = {};
    private _spawnBuilders: SpawnBuilder[] = [];
    private _spawns: StructureSpawn[] = [];
    private _myStructures: AnyOwnedStructure[] = [];
    private _resources: Resource[] = [];
    private _sources: Source[] = [];
    private _myCreeps: Creep[] = [];
    private _name: string = "";
    private _energyCapacity: number = 300;
    private _energy: number = 300;

    private constructor() {
        super();
    }

    public get resources(): Resource[] {
        return this._resources;
    }

    public get spawns(): StructureSpawn[] {
        return this._spawns.concat(this._spawnBuilders.map(sb => sb.build()));
    }

    public get name(): string {
        return this._name;
    }

    public static create(): RoomBuilder {
        return new RoomBuilder();
    }

    public withMemory(value: any): RoomBuilder {
        this._memory = value;

        return this;
    }

    public withEnergyCapacity(value: number): RoomBuilder {
        this._energyCapacity = value;

        return this;
    }

    public withEnergy(value: number): RoomBuilder {
        this._energy = value;

        return this;
    }

    public withoutSpawns(): RoomBuilder {
        this._spawnBuilders = [];

        return this;
    }

    public withSpawn(builder: StructureSpawn): RoomBuilder;
    public withSpawn(builder: ((builder: SpawnBuilder) => void)): RoomBuilder;
    public withSpawn(builder: StructureSpawn | ((builder: SpawnBuilder) => void)): RoomBuilder {
        if (typeof (builder) === "function") {
            const spawnBuilder = SpawnBuilder.create();
            builder(spawnBuilder);
            return this.withSpawnBuilder(spawnBuilder);
        }

        this._spawns.push(builder);
        this._myStructures.push(builder);
        return this;
    }

    public withSpawnBuilder(builder: SpawnBuilder): RoomBuilder {
        this._spawnBuilders.push(builder);

        return this;
    }

    public withMyStructure(structure: AnyOwnedStructure): RoomBuilder {
        this._myStructures.push(structure);

        return this;
    }

    public withResource(resource: Resource): RoomBuilder {
        if (this._resources === undefined) {
            this._resources = [];
        }

        this._resources.push(resource);

        return this;
    }

    public withoutResources(): RoomBuilder {
        this._resources = [];

        return this;
    }

    public withMyCreeps(creeps: Creep[]): RoomBuilder {
        this._myCreeps = this._myCreeps.concat(creeps);

        return this;
    }

    public withSource(source: Source): RoomBuilder {
        this._sources.push(source);

        return this;
    }

    private configureFindSpawns(): void {
        let spawns: StructureSpawn[] = [];
        if (_.any(this._spawnBuilders)) {
            spawns = this._spawnBuilders.map(s => s.build());
            this._myStructures = this._myStructures.concat(spawns);
        }

        if (_.any(this._spawns)) {
            spawns = spawns.concat(this._spawns);
        }

        this._mock
            .setup(r => r.find(TypeMoq.It.isValue(FIND_MY_SPAWNS), TypeMoq.It.isAny()))
            .callback((a, b) => {
                assert.isTrue(typeof b.filter === "function");
            })
            .returns((a, b) => {
                if (b && b.filter !== undefined) {
                    return _.filter(spawns, b.filter);
                }

                return spawns;
            });
    }

    private configureFindDroppedResource(): void {
        this.mock
            .setup(r => r.find(It.isValue(FIND_DROPPED_RESOURCES), It.isAny()))
            .returns((a, b) => {
                if (b === undefined || b.filter === undefined) {
                    return this._resources;
                }

                return _.filter(this._resources, b.filter);
            });

        this.mock
            .setup(r => r.find(It.isValue(FIND_DROPPED_RESOURCES)))
            .returns(() => this._resources);
    }

    private configureFindMyStructures(): void {
        this.mock
            .setup(r => r.find(FIND_MY_STRUCTURES, It.isAny()))
            .returns((a, b) => {
                if (b === undefined || b.filter === undefined) {
                    return this._myStructures;
                }
                return _.filter(this._myStructures, b.filter);
            });
    }

    private configureMyCreeps(): void {
        this.mock
            .setup(r => r.find(It.isValue(FIND_MY_CREEPS), It.isAny()))
            .returns((a, b) => {
                if (b === undefined || b.filter === undefined) {
                    return this._myCreeps;
                }

                return _.filter(this._myCreeps, b.filter);
            });
    }

    private configureSources(): void {
        this.mock
            .setup(r => r.find(It.isValue(FIND_SOURCES), It.isAny()))
            .returns((a, b) => {
                if (b === undefined || b.filter === undefined) {
                    return this._sources;
                }

                return _.filter(this._sources, b.filter);
            })
    }

    public build(): Room {
        this._name = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        this.mock
            .setup(r => r.name)
            .returns(r => `Room_${this.name}`);

        this.mock
            .setup(r => r.memory)
            .returns(() => this._memory);

        this.mock
            .setup(r => r.energyAvailable)
            .returns(() => this._energy);

        this.mock
            .setup(r => r.energyCapacityAvailable)
            .returns(() => this._energyCapacity);

        this.configureSources();
        this.configureFindSpawns();
        this.configureFindMyStructures();
        this.configureFindDroppedResource();
        this.configureMyCreeps();

        return this._mock.object;
    }
}
