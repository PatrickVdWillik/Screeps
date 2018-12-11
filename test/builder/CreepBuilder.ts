import { AbstractBuilder } from "./AbstractBuilder";
import { RoomBuilder } from "./RoomBuilder";
import { IMock, Mock, It } from "typemoq";

export class CreepBuilder extends AbstractBuilder<Creep> {
    private _roomBuilder: RoomBuilder;
    private _room: Room;

    constructor() {
        super();
    }

    public static create(): CreepBuilder {
        return new CreepBuilder();
    }

    public withRoom(room: Room): CreepBuilder {
        this._room = room;

        return this;
    }

    public withRoomBuilder(builder: RoomBuilder): CreepBuilder {
        this._roomBuilder = builder;
        return this;
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

    public withCarryCapacity(capacity: number): CreepBuilder {
        this.mock.setup(c => c.carryCapacity).returns(() => capacity);

        return this;
    }
    
    public carry(resource: ResourceConstant, amount: number): CreepBuilder {
        const store: StoreDefinition = {
            energy: 0
        };
        store[resource] = amount;
        console.log(`${JSON.stringify(store)}`)
        
        this.mock.setup(c => c.carry).returns(() => store);
        
        return this;
    }

    public build(): Creep {
        if (this._roomBuilder) {
            this._room = this._roomBuilder.build();
        }

        this.mock
            .setup(c => c.room)
            .returns(c => this._room);

        return this.mock.object;
    }
}
