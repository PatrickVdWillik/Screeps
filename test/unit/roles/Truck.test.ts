import { IMock, Mock, It, Times } from "typemoq";
import { CreepBuilder } from "../../builder/CreepBuilder";
import { RoomBuilder } from "../../builder/RoomBuilder";
import { Truck } from "../../../src/roles/Truck";
import { Game } from "../mock";

describe("truck that isn't loaded", () => {
    let _creepBuilder: CreepBuilder;
    let _roomBuilder: RoomBuilder;

    function getRole(): Truck {
        return new Truck(_creepBuilder.build());
    }

    beforeEach(() => {
        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);

        _roomBuilder = RoomBuilder.create();
        
        _creepBuilder = CreepBuilder.create()
            .withRoomBuilder(_roomBuilder)
            .withMemory({
                role: "Truck"
            });
    });

    it("will find dropped energy", () => {

    })
});
