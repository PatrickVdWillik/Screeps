import { AbstractBuilder } from "./AbstractBuilder";
import { IMock, Mock, It } from "typemoq";

export class CreepBuilder extends AbstractBuilder<Creep> {
    constructor() {
        super();
    }

    public static create(): CreepBuilder {
        return new CreepBuilder();
    }

    public withMemory(memory: any): CreepBuilder {
        this._mock
            .setup(c => c.memory)
            .returns(() => memory as CreepMemory);

        return this;
    }

    public harvest(target: Source | Mineral, result: CreepActionReturnCode | ERR_NOT_FOUND | ERR_NOT_ENOUGH_RESOURCES): CreepBuilder {
        this.mock
            .setup(c => c.harvest(It.is(t => t === target)))
            .returns(() => result);

        return this;
    }

    public moveTo(target: RoomPosition | { pos: RoomPosition }, result: CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND, opts?: MoveToOpts): CreepBuilder {
        this.mock
            .setup(c => c.moveTo(It.isValue(target), It.isValue(opts)))
            .returns(() => result);

        return this;
    }

    public pickup(target: Resource, result: CreepActionReturnCode | ERR_FULL): CreepBuilder {
        this.mock
            .setup(c => c.pickup(target))
            .returns(c => result);

        return this;
    }

    public build(): Creep {
        return this.mock.object;
    }
}
