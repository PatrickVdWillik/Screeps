import { Mock, IMock, It, Times } from "typemoq";
import { ResourcePlanner } from "../../../src/planning/ResourcePlanner";
import { ISpawnQueue, QueuePriority } from "../../../src/SpawnQueue";
import { RoomBuilder } from "../../builder/RoomBuilder";
import { CreepBuilder } from "../../builder/CreepBuilder";

describe("ResourcePlanner", () => {
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

        let _source = Mock.ofType<Source>();
        _source.setup(s => s.id).returns(() => "source_1");
        _source.setup(s => s.energyCapacity).returns(() => SOURCE_ENERGY_CAPACITY);
        _source.setup(s => s.energy).returns(() => SOURCE_ENERGY_CAPACITY);

        _roomBuilder = RoomBuilder
            .create()
            .withMemory(_memory)
            .withEnergyCapacity(300)
            .withEnergy(300);

        _buildQueue = Mock.ofType<ISpawnQueue>();
    });

    describe("in a rooom with a source", () => {
        describe("without miners and trucks", () => {
            describe("with a queued miner", () => {
                beforeEach(() => {
                    _buildQueue.setup(q => q.getRequestCount(It.isValue("Miner"))).returns(() => 1);
                });

                it("won't queue another miner", () => {
                    run();

                    _buildQueue.verify(q => q.push(It.isValue("Miner"), It.isAny(), It.isAny(), It.isAny()), Times.never());
                });
            });

            it("will spawn a miner", () => {
                run();

                _buildQueue.verify(q => q.push(It.isValue("Miner"), 300, It.isAny(), QueuePriority.Critical), Times.once());
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
                });

                it("won't queue another truck", () => {
                    run();

                    _buildQueue.verify(q => q.push("Truck", It.isAny(), It.isAny(), It.isAny()), Times.never());
                });
            });

            it("will spawn a truck", () => {
                run();

                _buildQueue.verify(q => q.push(It.isValue("Truck"), 300, It.isAny(), QueuePriority.Critical), Times.once());
            });
        });
    });
});
