import { IMock, Mock, It, Times } from "typemoq";
import { assert } from "chai";
import { CreepBuilder } from "../../builder/CreepBuilder";
import { RoomBuilder } from "../../builder/RoomBuilder";
import { ResourceBuilder } from "../../builder/ResourceBuilder";
import { Truck } from "../../../src/roles/Truck";
import { Game } from "../mock";

describe("Truck", () => {
    describe("isn't loaded", () => {
        let _creepBuilder: CreepBuilder;
        let _roomBuilder: RoomBuilder;
        const _memory = {
            role: "Truck"
        };

        function getRole(): Truck {
            return new Truck(_creepBuilder.build());
        }
    
        beforeEach(() => {
            // @ts-ignore : allow adding Game to global
            global.Game = _.clone(Game);
    
            _roomBuilder = RoomBuilder.create();
            
            _creepBuilder = CreepBuilder.create()
                .withRoomBuilder(_roomBuilder)
                .withMemory(_memory);
        });
    
        describe("with a resource in the room", () => {
            const _resourceId = "123";
            
            beforeEach(() => {
                const r = ResourceBuilder
                    .create()
                    .atPos(4, 4)
                    .ofResourceType(RESOURCE_ENERGY)
                    .withAmount(100)
                    .withId(_resourceId)
                    .build();
                    
               _roomBuilder.withResource(r);
            });
            
            describe("and no stored target", () => {
                it("will store the id in memory", () => {
                    getRole().run();
                    
                    assert.equal(_memory.target, _resourceId);
                });
            });

            
            it("", () => {
                
            });
        });

    });

});
