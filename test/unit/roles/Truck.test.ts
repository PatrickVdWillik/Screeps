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
        const _memory: any = {
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
                .withMemory(_memory)
                .withCarryCapacity(200);
        });

        describe("that isn't full", () => {
            describe("without a task", () => {
                beforeEach(() => {
                    _memory.task = undefined;
                    _roomBuilder.withoutResources();
                });
                
                it("will change to loading", () => {
                    getRole().run();
                    
                    assert.equal(_memory.task, "loading");
                });
            });
            
            describe("without anything to pickup", () => {
                beforeEach(() => {
                    _roomBuilder.withoutResources();
                });
                
                it("won't do anything", () => {
                    getRole().run();
                });
            });
            
            describe("with a resource in the room", () => {
                const _resourceId = "123";
                let _resource: Resource;

                beforeEach(() => {
                    _resource = ResourceBuilder
                        .create()
                        .atPos(4, 4)
                        .ofResourceType(RESOURCE_ENERGY)
                        .withAmount(100)
                        .withId(_resourceId)
                        .build();

                    _roomBuilder.withResource(_resource);
                });

                describe("and no stored target", () => {
                    describe("successful pickup", () => {
                        beforeEach(() => {
                            _creepBuilder.pickup(_resource, OK);
                        });

                        it("won't save to memory", () => {
                            getRole().run();

                            assert.equal(_memory.target, undefined);
                            _creepBuilder.mock.verify(c => c.pickup(_resource), Times.once());
                        });
                    });

                    describe("not in range", () => {
                        beforeEach(() => {
                            _creepBuilder.pickup(_resource, ERR_NOT_IN_RANGE);
                        });

                        it("will store the id in memory and moveTo target", () => {
                            getRole().run();

                            assert.equal(_memory.target, _resourceId);
                            _creepBuilder.mock.verify(c => c.moveTo(_resource), Times.once());
                        });
                    });
                    
                    describe("fully loaded after pickup", () => {
                        beforeEach(() => {
                            _creepBuilder
                                .carry(RESOURCE_ENERGY, 150)
                                .pickup(_resource, OK);
                            
                        });
                        
                        it.only("will change to delivering", () => {
                            getRole().run();    
                            
                            assert.equal(_memory.task, "delivering");
                        });
                    })
                });
            });
        });
    });
});
