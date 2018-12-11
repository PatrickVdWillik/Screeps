import * as TypeMoq from "typemoq";
import * as _ from "lodash";
import { IMock, Mock, It, Times } from "typemoq";
import { AbstractBuilder } from "./AbstractBuilder";
import { SpawnBuilder } from "./SpawnBuilder";
import { assert } from "chai";

export class RoomBuilder extends AbstractBuilder<Room> {
    private _spawnBuilders: SpawnBuilder[] = [];
    private _resources: Resource[];
    private _name: string = "";

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

    public withSpawn(builderFn: (builder: SpawnBuilder) => void): RoomBuilder {
        const builder = SpawnBuilder.create();
        builderFn(builder);
        return this.withSpawnBuilder(builder);
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

    // TODO: Re-factor to allow usage without a filter.
    private configureFindSpawns(): void {
        const spawns = this._spawnBuilders.map(s => s.build());
        this._mock
            .setup(r => r.find(TypeMoq.It.isValue(FIND_MY_SPAWNS), TypeMoq.It.isAny()))
            .callback((a, b) => {
                assert.isTrue(typeof b.filter === "function");
            })
            .returns((a, b) => {
                return _.filter(spawns, b.filter);
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

        if (this._spawnBuilders.length > 0) {
            this.configureFindSpawns();
        }

        if (this._resources) {
            this.configureFindDroppedResource();
        }

        return this._mock.object;
    }
}
