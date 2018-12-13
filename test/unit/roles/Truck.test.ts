import { IMock, Mock, It, Times, MockBehavior } from "typemoq";
import { assert } from "chai";
import { SpawnFakeBuilder } from "../../fake/SpawnFakeBuilder";
import { CreepBuilder } from "../../builder/CreepBuilder";
import { RoomBuilder } from "../../builder/RoomBuilder";
import { SpawnBuilder } from "../../builder/SpawnBuilder";
import { ResourceBuilder } from "../../builder/ResourceBuilder";
import { Truck } from "../../../src/roles/Truck";
import { Game } from "../mock";

describe("Truck", () => {
    let _creepBuilder: CreepBuilder;
    let _roomBuilder: RoomBuilder;
    let _creep: Creep;
    let _memory: any;

    function getRole(): Truck {
        _creep = _creepBuilder.build();
        return new Truck(_creep);
    }

    beforeEach(() => {
        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);

        _roomBuilder = RoomBuilder.create();

        _memory = {
            role: "Truck"
        };

        _creepBuilder = CreepBuilder.create()
            .withRoomBuilder(_roomBuilder)
            .withMemory(_memory)
            .withCarryCapacity(200);
    });

    describe("that is empty", () => {
        beforeEach(() => {
            _creepBuilder.carry(RESOURCE_ENERGY, 0);
        });

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

                    it("won't save id to memory", () => {
                        getRole().run();

                        assert.equal(_memory.target, undefined);
                        _creepBuilder.mock.verify(c => c.pickup(_resource), Times.once());
                    });

                    describe("and not fully loaded after pickup", () => {
                        it("will stay in loading state", () => {
                            getRole().run();

                            assert.equal(_memory.task, "loading");
                        });
                    });
                });

                describe("not in range", () => {
                    beforeEach(() => {
                        _creepBuilder.pickup(_resource, ERR_NOT_IN_RANGE);
                    });

                    it("will store the id in memory and moveTo target", () => {
                        getRole().run();

                        assert.equal(_memory.target, _resourceId);
                        _creepBuilder.mock.verify(c => c.moveTo(It.isObjectWith(_resource)), Times.once());
                    });
                });

                describe("fully loaded after pickup", () => {
                    beforeEach(() => {
                        _creepBuilder
                            .carry(RESOURCE_ENERGY, 150)
                            .pickup(_resource, OK);

                    });

                    it("will change to delivering", () => {
                        getRole().run();

                        assert.equal(_memory.task, "delivering");
                    });
                });
            });

            describe("with a stored target", () => {
                beforeEach(() => {
                    _memory.target = _resourceId;
                    _memory.task = "loading";
                    Game.objects[_resourceId] = _resource;
                });

                it("won't call room.find()", () => {
                    getRole().run();

                    _roomBuilder.mock.verify(r => r.find(It.isValue(FIND_DROPPED_RESOURCES)), Times.never());
                });
            });
        });
    });

    describe("that is partially loaded", () => {
        beforeEach(() => {
            _creepBuilder
                .carry(RESOURCE_ENERGY, 150);
        });

        describe("and cannot find another drop", () => {
            beforeEach(() => {
                _roomBuilder.withoutResources();
            });

            it("will switch to deliver", () => {
                getRole().run();

                assert.equal(_memory.task, "delivering");
            });
        });
    });

    describe("that is full", () => {
        describe("without a task", () => {
            beforeEach(() => {
                _memory.task = undefined;
                _roomBuilder.withoutResources();
                _creepBuilder.carry(RESOURCE_ENERGY, 200);
            });

            it("will switch to delivery", () => {
                getRole().run();

                assert.equal(_memory.task, "delivering");
            });
        });

        describe("with empty spawn", () => {
            let _spawn: StructureSpawn;

            beforeEach(() => {
                _spawn = SpawnFakeBuilder
                    .create()
                    .withId("xyz")
                    .withEnergy(0)
                    .build();

                _roomBuilder.withSpawn(_spawn);

                console.log("s: " + JSON.stringify(_spawn));
                _memory["task"] = "delivering";
                _creepBuilder = CreepBuilder.create(MockBehavior.Strict)
                    .withRoomBuilder(_roomBuilder)
                    .withMemory(_memory)
                    .withCarryCapacity(200)
                    .transfer(_spawn, RESOURCE_ENERGY, ERR_NOT_IN_RANGE)
                    .carry(RESOURCE_ENERGY, 100)
                    .moveTo(_spawn, OK);

            });

            it("will deliver to spawn", () => {
                getRole().run();

                _creepBuilder.mock.verify(c => c.transfer(It.isValue(_spawn), It.isValue(RESOURCE_ENERGY), It.isValue(100)), Times.once())
                _creepBuilder.mock.verify(c => c.moveTo(It.isAny()), Times.once())
            });
        });
    });
});
