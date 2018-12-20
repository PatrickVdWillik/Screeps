import { Mock, IMock, It, Times } from "typemoq";
import { ResourcePlanner } from "../../../src/planning/ResourcePlanner";
import { ISpawnQueue, QueuePriority } from "../../../src/SpawnQueue";
import { RoomBuilder } from "../../builder/RoomBuilder";
import { CreepBuilder } from "../../builder/CreepBuilder";
import { SpawnBuilder } from "../../builder/SpawnBuilder";

describe("ResourcePlanner", () => {
    const SourceId: string = "source_1";
    let _myCreeps: Creep[];
    let _source: Source;
    let _roomBuilder: RoomBuilder;
    let _spawnBuilder: SpawnBuilder;
    let _buildQueue: IMock<ISpawnQueue>;
    let _memory: any;

    function run(): void {
        const planner = new ResourcePlanner(_roomBuilder.build(), _buildQueue.object);
        planner.run();
    }

    beforeEach(() => {
        _myCreeps = [];

        _roomBuilder = RoomBuilder
            .create()
            .withMemory(_memory)
            .withEnergyCapacity(300)
            .withEnergy(300);

        _buildQueue = Mock.ofType<ISpawnQueue>();
    });

    describe("in an uninitialized state", () => {
        
        describe("with 2 sources in the room", () => {
            let _source1: Source;
            let _source2: Source;
            let _spawn: Spawn;
            
            beforeEach(() => {
                _source1 = SourceBuilder.create()
                    .withEnergyCapacity(SOURCE_ENERGY_CAPACITY)
                    .withEnergy(SOURCE_ENERGY_CAPACITY)
                    .withId("source_1")
                    .build();
                    
                _source2 = SourceBuilder.create()
                    .withEnergyCapacity(SOURCE_ENERGY_CAPACITY)
                    .withEnergy(SOURCE_ENERGY_CAPACITY)
                    .withId("source_2")
                    .build();
                
                const spawnBuilder = SpawnBuilder.create()
                    .withEnergy(300)
            });
            
            it("will initialize the room", () => {
                
            });
        });
    });
    
    describe("in a room with a source", () => {
        beforeEach(() => {
            let _sourceMock = Mock.ofType<Source>();
            _sourceMock.setup(s => s.id).returns(() => SourceId);
            _sourceMock.setup(s => s.energyCapacity).returns(() => SOURCE_ENERGY_CAPACITY);
            _sourceMock.setup(s => s.energy).returns(() => SOURCE_ENERGY_CAPACITY);
            _source = _sourceMock.object
            
            _roomBuilder.withSource(_source);
        });
        
        it("will initialize itself at first run", () => {
            
        });

        describe("without miners and trucks", () => {
            it("will spawn a miner", () => {
                run();

                _buildQueue.verify(q => q.push(It.isValue("Miner"), It.isObjectWith({ maxCost: 300 }), It.isValue(QueuePriority.Critical)), Times.once());
            });

            describe("with a queued miner", () => {
                beforeEach(() => {
                    _buildQueue.setup(q => q.getRequestCount(It.isValue("Miner"))).returns(() => 1);
                });

                it("won't queue another miner", () => {
                    run();

                    _buildQueue.verify(q => q.push(It.isValue("Miner"), It.isAny(), It.isAny()), Times.never());
                });
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
            })
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
                });

                it("won't queue another truck", () => {
                    run();

                    _buildQueue.verify(q => q.push("Truck", It.isAny(), It.isAny()), Times.never());
                });
            });

            it("will spawn a truck", () => {
                run();

                _buildQueue.verify(q => q.push(It.isValue("Truck"), It.isObjectWith({ maxCost: 300 }), It.isValue(QueuePriority.Critical)), Times.once());
            });
        });

        describe("with a miner and truck", () => {
            beforeEach(() => {
                const miner = CreepBuilder
                    .create()
                    .withName("Miner1")
                    .withBody([WORK, MOVE, CARRY])
                    .withMemory({ role: "Miner", target: SourceId })
                    .build();

                const truck = CreepBuilder
                    .create()
                    .withName("Truck2")
                    .withBody([MOVE, CARRY, MOVE, CARRY])
                    .withMemory({ role: "Truck" })
                    .build();

                _myCreeps = [miner, truck];
            });

            it("will attempt to create biggest miner needed", () => {
                run();


            })
        })
    });
});
