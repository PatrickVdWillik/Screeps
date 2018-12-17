import { Mock, IMock, It, Times } from "typemoq";
import { ResourcePlanner } from "../../../src/planning/ResourcePlanner";
import { ISpawnQueue, QueuePriority } from "../../../src/SpawnQueue";
import { RoomBuilder } from "../../builder/RoomBuilder";
import { CreepBuilder } from "../../builder/CreepBuilder";

describe("ResourcePlanner", () => {
    const SourceId: string = "source_1";
    let _myCreeps: Creep[];
    let _roomBuilder: RoomBuilder;
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

    describe("in a rooom with a source", () => {
        beforeEach(() => {
            let _source = Mock.ofType<Source>();
            _source.setup(s => s.id).returns(() => SourceId);
            _source.setup(s => s.energyCapacity).returns(() => SOURCE_ENERGY_CAPACITY);
            _source.setup(s => s.energy).returns(() => SOURCE_ENERGY_CAPACITY);
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
