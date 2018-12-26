import { AbstractBuilder } from "./AbstractBuilder";
import { RoomPosBuilder } from "./RoomPosBuilder";

export class SourceBuilder extends AbstractBuilder<Source> {
    private constructor() {
        super();
    }

    public static create(): SourceBuilder {
        return new SourceBuilder();
    }

    public withId(value: string): SourceBuilder {
        this.mock.setup(s => s.id).returns(() => value);

        return this;
    }

    public withEnergyCapacity(value: number): SourceBuilder {
        this.mock.setup(s => s.energyCapacity).returns(() => value);

        return this;
    }

    public withEnergy(value: number): SourceBuilder {
        this.mock.setup(s => s.energy).returns(() => value);

        return this;
    }

    public withPos(x: number, y: number): SourceBuilder {
        this.mock
            .setup(s => s.pos)
            .returns(() => RoomPosBuilder.create(x, y).build());

        return this;
    }

    public build(): Source {
        return this.mock.object;
    }
}
