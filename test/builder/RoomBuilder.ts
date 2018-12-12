import * as TypeMoq from "typemoq";
import * as _ from "lodash";
import { IMock, Mock, It, Times } from "typemoq";
import { AbstractBuilder } from "./AbstractBuilder";
import { SpawnBuilder } from "./SpawnBuilder";
import { assert } from "chai";

export class RoomBuilder extends AbstractBuilder<Room> {
    private _spawnBuilders: SpawnBuilder[] = [];
    private _spawns: StructureSpawn[] = [];
    private _resources: Resource[];
    private _name: string = "";

    public get resources(): Resource[] {
        return this._resources;
    }

    public get spawns(): StructureSpawn[] {
        return this._spawns.concat(this._spawnBuilders.map(sb => sb.build()));
    }

    public get name(): string {
        return this._name;
    }

    private constructor() {
        super();
    }

    public static create(): RoomBuilder {
        return new RoomBuilder();
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
        return this;
    }

    public withSpawnBuilder(builder: SpawnBuilder): RoomBuilder {
        this._spawnBuilders.push(builder);

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

    private configureFindSpawns(): void {
        let spawns: StructureSpawn[] = [];
        if (_.any(this._spawnBuilders)) {
            spawns = this._spawnBuilders.map(s => s.build());
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

    public build(): Room {
        this._name = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        this.mock
            .setup(r => r.name)
            .returns(r => `Room_${this.name}`);


        this.configureFindSpawns();
        this.configureFindDroppedResource();

        return this._mock.object;
    }
}
