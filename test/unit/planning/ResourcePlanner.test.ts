import { Mock, IMock, It, Times } from "typemoq";
import { ResourcePlanner } from "../../../src/planning/ResourcePlanner";
import { ISpawnQueue, QueuePriority } from "../../../src/SpawnQueue";
import { RoomBuilder } from "../../builder/RoomBuilder";

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

            it("will spawn a miner", () => {
                run();

                _buildQueue.verify(q => q.push("Miner", 300, {}, QueuePriority.Critical), Times.once());
            });
        });

        describe("without trucks", () => {

        });
    });
});
