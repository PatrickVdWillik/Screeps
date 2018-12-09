import { IMock, Mock, It, Times } from "typemoq";
import { CreepBuilder } from "../../builder/CreepBuilder";
import { Truck } from "../../../src/roles/Truck";

describe("truck that isn't loaded", () => {
    let _creepBuilder: CreepBuilder;

    function getRole(): Truck {
        return new Truck(_creepBuilder.build());
    }

    beforeEach(() => {
        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);

        _creepBuilder = CreepBuilder.create()
            .withRoomBuilder(_roomBuilder)
            .withMemory({
                role: "Truck"
            });
    });

    it("will find dropped energy", () => {

    })
});
