import { RoomBuilder } from "./RoomBuilder";
import { SpawnBuilder } from "./SpawnBuilder";
import { SourceBuilder } from "./SourceBuilder";

export class ScenarioBuilder {
    private _roomBuilder: RoomBuilder = RoomBuilder.create();
    private _spawnBuilder: SpawnBuilder = SpawnBuilder.create();

    private constructor() {
    }

    public static create(): ScenarioBuilder {
        return new ScenarioBuilder();
    }

    public withDefaultRoom(name: string): ScenarioBuilder {
        const spawn = SpawnBuilder.create()
            .withPos(25, 25)
            .withName("Spawn1")
            .withId("Spawn1")
            .isNotSpawning()
            .build();

        const source1 = SourceBuilder.create()
            .withPos(35, 35)
            .withEnergy(SOURCE_ENERGY_CAPACITY)
            .withEnergyCapacity(SOURCE_ENERGY_CAPACITY)
            .withId("Source1")
            .build();

        const source2 = SourceBuilder.create()
            .withPos(10, 10)
            .withId("Source2")
            .withEnergy(SOURCE_ENERGY_CAPACITY)
            .withEnergyCapacity(SOURCE_ENERGY_CAPACITY)
            .build();

        this._roomBuilder
            .withEnergyCapacity(500)
            .withEnergy(500)
            .withSource(source1)
            .withSource(source2)
            .withSpawn(spawn);


        return this;
    }
}
