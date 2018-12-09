import { IMock, Mock, It, Times } from "typemoq";
import { Game } from "../mock";
import { Miner } from "../../../src/roles/Miner";

describe("creep with miner role", () => {
    let _creep: IMock<Creep>;
    let _sourceMock: IMock<Source>;
    let _sourceObject: Source;

    function getRole(): Miner {
        return new Miner(_creep.object);
    }

    beforeEach(() => {
        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);

        _creep = Mock.ofType<Creep>();
        _creep.setup(c => c.memory)
            .returns(c => ({
                role: "Miner",
                source: "1"
            }) as CreepMemory);

        _sourceMock = Mock.ofType<Source>();
        _sourceMock.setup(s => s.id).returns(s => "1");
        _sourceObject = _sourceMock.object;
        Game.objects[_sourceObject.id] = _sourceObject;
    });

    describe("in range of source", () => {
        beforeEach(() => {
            _creep
                .setup(c => c.harvest(It.isAny()))
                .returns(c => OK);
        });

        it("will harvest the source", () => {
            getRole().run();

            _creep.verify(c => c.harvest(It.is(s => s === _sourceObject)), Times.once());
        })
    })

    describe("not in range of the source", () => {
        beforeEach(() => {
            _creep.setup(c => c.harvest(It.isAny())).returns(() => ERR_NOT_IN_RANGE);
        });

        it("will move towards source", () => {
            getRole().run();

            _creep.verify(c => c.moveTo(It.is(s => s === _sourceObject)), Times.once());
        });
    });
})
