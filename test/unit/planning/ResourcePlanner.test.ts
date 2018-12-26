import { Mock, IMock, It, Times } from "typemoq";
import { ResourcePlanner } from "../../../src/planning/ResourcePlanner";
import { ISpawnQueue, QueuePriority } from "../../../src/SpawnQueue";
import { RoomBuilder } from "../../builder/RoomBuilder";
import { CreepBuilder } from "../../builder/CreepBuilder";
import { SpawnBuilder } from "../../builder/SpawnBuilder";
import { SourceBuilder } from "../../builder/SourceBuilder";
import { Game, Memory } from "../mock";

describe("ResourcePlanner", () => {
    const SourceId: string = "source_1";
    let _pathFinderMock: IMock<PathFinder>;
    let _myCreeps: Creep[];
    let _source: Source;
    let _roomBuilder: RoomBuilder;
    let _spawnBuilder: SpawnBuilder;
    let _buildQueue: IMock<ISpawnQueue>;
    let _memory: any;
    let _spawn: StructureSpawn;

    function run(): void {
        // @ts-ignore
        global.PathFinder = _pathFinderMock.object;

        const planner = new ResourcePlanner(_roomBuilder.build(), _buildQueue.object);
        planner.run();
    }

    beforeEach(() => {
        _myCreeps = [];
        _memory = {};
        _pathFinderMock = Mock.ofType<PathFinder>();

        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);
        // @ts-ignore : allow adding Memory to global
        global.Memory = _.clone(Memory);

        _spawnBuilder = SpawnBuilder.create()
            .withEnergy(300)
            .withId("Spawn_1")
            .withName("Spawn1")
            .withPos(5, 5);
        _spawn = _spawnBuilder.build();
        Game.spawns[_spawn.name] = _spawn;

        _roomBuilder = RoomBuilder
            .create()
            .withMemory(_memory)
            .withEnergyCapacity(300)
            .withEnergy(300)
            .withSpawn(_spawn)
            .withMyCreeps(_myCreeps);

        _buildQueue = Mock.ofType<ISpawnQueue>();
    });

    describe("in an uninitialized state", () => {

        describe("with 2 sources in the room", () => {
            let _source1: Source;
            let _source2: Source;

            const expectedMainSpawn = "Spawn1";
            const Source1Id = "source_1";
            const Source2Id = "source_2";
            const expectedSourceIds = [{ id: Source1Id, path: 30 }, { id: Source2Id, path: 20 }];

            beforeEach(() => {
                _source1 = SourceBuilder.create()
                    .withEnergyCapacity(SOURCE_ENERGY_CAPACITY)
                    .withEnergy(SOURCE_ENERGY_CAPACITY)
                    .withId(Source1Id)
                    .withPos(30, 31)
                    .build();

                _source2 = SourceBuilder.create()
                    .withEnergyCapacity(SOURCE_ENERGY_CAPACITY)
                    .withEnergy(SOURCE_ENERGY_CAPACITY)
                    .withId(Source2Id)
                    .withPos(15, 5)
                    .build();

                _roomBuilder
                    .withSource(_source1)
                    .withSource(_source2);

                Game.objects[_source1.id] = _source1;
                Game.objects[_source2.id] = _source2;

                _pathFinderMock.setup(pf => pf.search(It.isValue(_spawn.pos), { pos: _source1.pos, range: 1 }, It.isAny()))
                    .returns(() => ({ path: [], ops: 666, cost: 30, incomplete: false }));
                _pathFinderMock.setup(pf => pf.search(It.isValue(_spawn.pos), { pos: _source2.pos, range: 1 }, It.isAny()))
                    .returns(() => ({ path: [], ops: 666, cost: 20, incomplete: false }));

                _memory.mainSpawn = expectedMainSpawn;
                _buildQueue.setup(q => q.getRequestCount(It.isAnyString())).returns(() => 2);
            });

            it("will initialize the room", () => {
                run();

                expect(_memory).toMatchObject({
                    resourcePlanner: {
                        mainSpawn: expectedMainSpawn,
                        sources: expectedSourceIds
                    }
                });
            });
        });
    });

    describe("in a room with a source", () => {
        beforeEach(() => {
            _source = SourceBuilder.create()
                .withId(SourceId)
                .withEnergyCapacity(SOURCE_ENERGY_CAPACITY)
                .withEnergy(SOURCE_ENERGY_CAPACITY)
                .build();
            Game.addObject(_source);

            _roomBuilder.withSource(_source);

            _.assign(_memory, {
                mainSpawn: "Spawn1",
                resourcePlanner: {
                    mainSpawn: "Spawn1",
                    sources: [SourceId]
                }
            });
        });

        describe("without miners and trucks", () => {
            describe("with empty spawn queue", () => {
                beforeEach(() => {
                    _buildQueue.setup(q => q.getRequestCount(It.isValue("Truck"))).returns(() => 0);
                    _buildQueue.setup(q => q.getRequestCount(It.isValue("Miner"))).returns(() => 0);
                });

                it("will spawn a miner", () => {
                    run();

                    _buildQueue.verify(q => q.push(It.isValue("Miner"), It.isObjectWith({ maxCost: 300 }), It.isValue(QueuePriority.Critical)), Times.once());
                });

                describe("with no stored energy", () => {
                    beforeEach(() => {
                        _roomBuilder
                            .withEnergyCapacity(300)
                            .withEnergy(0);
                    });

                    it("will request a creep with minimum body size", () => {
                        run();

                        const minPrice = _.sum([WORK, CARRY, MOVE], (part) => BODYPART_COST[part]);
                        _buildQueue.verify(q => q.push(It.isValue("Miner"), It.isObjectWith({ maxCost: minPrice }), It.isAny()), Times.once());
                    });
                });
            })

            describe("with a queued miner", () => {
                beforeEach(() => {
                    _buildQueue.setup(q => q.getRequestCount(It.isValue("Truck"))).returns(() => 0);
                    _buildQueue.setup(q => q.getRequestCount(It.isValue("Miner"))).returns(() => 1);

                });

                it("won't queue another miner", () => {
                    run();

                    _buildQueue.verify(q => q.push(It.isValue("Miner"), It.isAny(), It.isAny()), Times.never());
                });
            });
        });

        describe("without a truck", () => {
            beforeEach(() => {
                const miner = CreepBuilder.create()
                    .withMemory({
                        role: "Miner"
                    }).build();
                _roomBuilder.withMyCreeps([miner]);
            });

            describe("with a queued truck", () => {
                beforeEach(() => {
                    _buildQueue.setup(q => q.getRequestCount(It.isValue("Truck"))).returns(() => 1);
                    _buildQueue.setup(q => q.getRequestCount(It.isValue("Miner"))).returns(() => 0);
                });

                it("won't queue another truck", () => {
                    run();

                    _buildQueue.verify(q => q.push("Truck", It.isAny(), It.isAny()), Times.never());
                });
            });

            describe("without a queued truck", () => {
                it("will spawn a truck", () => {
                    run();

                    _buildQueue.verify(q => q.push(It.isValue("Truck"), It.isObjectWith({ maxCost: 300 }), It.isValue(QueuePriority.Critical)), Times.once());
                });
            });
        });

        describe("with a miner and truck and an extra source", () => {
            const _energyAvailable = 1200;
            let _source2: Source;
            const Source2Id = "Source2"

            beforeEach(() => {
                _source2 = SourceBuilder
                    .create()
                    .withId(Source2Id)
                    .withEnergy(3000)
                    .withEnergyCapacity(3000)
                    .build();
                Game.addObject(_source2);
                _memory.resourcePlanner.sources.push(Source2Id);

                _roomBuilder
                    .withEnergyCapacity(_energyAvailable)
                    .withEnergy(_energyAvailable)
                    .withSource(_source2);

                const miner = CreepBuilder
                    .create()
                    .withName("Miner1")
                    .withBody([WORK, WORK, WORK, WORK, WORK, WORK, MOVE, CARRY])
                    .withMemory({ role: "Miner", target: SourceId })
                    .build();

                const truck = CreepBuilder
                    .create()
                    .withName("Truck2")
                    .withBody([MOVE, CARRY, MOVE, CARRY])
                    .withMemory({ role: "Truck" })
                    .build();

                _roomBuilder.withMyCreeps([miner, truck]);
            });

            describe("no queued miner", () => {
                beforeEach(() => {
                    _buildQueue.setup(q => q.getRequestCount(It.isValue("Truck"))).returns(() => 0);
                    _buildQueue.setup(q => q.getRequestCount(It.isValue("Miner"))).returns(() => 0);
                });

                it.only("will attempt to create biggest miner possible for other source", () => {
                    run();

                    _buildQueue.verify(q => q.push(It.isValue("Miner"), It.isObjectWith({ maxCost: _energyAvailable, work: 6, memory: { target: Source2Id } }), It.isValue(QueuePriority.Normal)), Times.once());
                });
            });

            describe("with full miners", () => {
                beforeEach(() => {
                    const miner = CreepBuilder
                        .create()
                        .withName("Miner2")
                        .withBody([WORK, WORK, WORK, WORK, WORK, WORK, MOVE, CARRY])
                        .withMemory({ role: "Miner", target: Source2Id })
                        .build();

                    _roomBuilder.withMyCreeps([miner]);
                });
            });
        })
    });
});
