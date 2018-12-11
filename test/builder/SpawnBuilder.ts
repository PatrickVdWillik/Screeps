import * as TypeMoq from "typemoq";
import { AbstractBuilder } from "./AbstractBuilder";

export class SpawnBuilder extends AbstractBuilder<StructureSpawn> {
    private constructor() {
        super();
    }

    public static create(): SpawnBuilder {
        return new SpawnBuilder();
    }

    public isNotSpawning(): SpawnBuilder {
        this.mock
            .setup(s => s.spawning)
            .returns(s => null);

        return this;
    }

    public isSpawning(spawning: Spawning): SpawnBuilder {
        this.mock
            .setup(s => s.spawning)
            .returns(s => spawning);

        return this;
    }

    public spawnCreep(result: ScreepsReturnCode): SpawnBuilder {
        this.mock
            .setup(s => s.spawnCreep(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
            .returns(s => result);

        return this;
    }
    
    public withEnergy(amount: number): SpawnBuilder {
        this.mock
            .setup(s => s.energy)
            .returns(() => amount);
            
        return this;
    }

    public build(): StructureSpawn {
        this.mock
            .setup(s => s.energyCapacity)
            .returns(() => SPAWN_ENERGY_CAPACITY);
            
        return this._mock.object;
    }
}
