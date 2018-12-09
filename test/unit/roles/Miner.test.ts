import { IMock, Mock, It, Times } from "typemoq";
import { Game } from "../mock";
import { Miner } from "../../../src/roles/Miner";
import { CreepBuilder } from "../../builder/CreepBuilder";

describe("creep with miner role", () => {
    let _creepBuilder: CreepBuilder;
    let _sourceMock: IMock<Source>;
    let _sourceObject: Source;

    function getRole(): Miner {
        return new Miner(_creepBuilder.build());
    }

    beforeEach(() => {
        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);

        _creepBuilder = CreepBuilder.create()
            .withMemory({
                role: "Truck",
                source: "1"
            });

        _sourceMock = Mock.ofType<Source>();
        _sourceMock.setup(s => s.id).returns(s => "1");
        _sourceObject = _sourceMock.object;
        Game.objects[_sourceObject.id] = _sourceObject;
    });

    describe("in range of source", () => {
        beforeEach(() => {
            _creepBuilder.harvest(_sourceObject, OK);
        });

        it("will harvest the source", () => {
            getRole().run();

            _creepBuilder.mock.verify(c => c.harvest(It.is(s => s === _sourceObject)), Times.once());
        })
    })

    describe("not in range of the source", () => {
        beforeEach(() => {
            _creepBuilder.harvest(_sourceObject, ERR_NOT_IN_RANGE);
        });

        it("will move towards source", () => {
            getRole().run();

            _creepBuilder.mock.verify(c => c.moveTo(It.is(s => s === _sourceObject)), Times.once());
        });
    });
})
