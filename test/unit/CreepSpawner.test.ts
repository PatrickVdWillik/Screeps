//import { assert } from "chai";
import { CreepSpawner } from "../../src/CreepSpawner";
import * as TypeMoq from "typemoq";

describe("CreepSpawner", () => {
    let _room: TypeMoq.IMock<Room>;
    let _spawner: CreepSpawner;

    describe("no available spawns", () => {
        beforeEach(() => {
            _room = TypeMoq.Mock.ofType<Room>();
            _room
                .setup(r => r.find(TypeMoq.It.isValue(FIND_MY_SPAWNS)))
                .returns(() => [] as StructureSpawn[]);

            _spawner = new CreepSpawner(_room.object);

        })

        it("won't do anything", () => {
            _spawner.run();
        });
    });

    describe("available spawn", () => {
        let _spawn: TypeMoq.IMock<StructureSpawn>;

        beforeEach(() => {
            _spawn = TypeMoq.Mock.ofType<StructureSpawn>();
            _spawn.setup((s) => s.spawnCreep(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
                .returns(() => OK as ScreepsReturnCode);

            _room = TypeMoq.Mock.ofType<Room>();
            _room.setup(r => r.find(TypeMoq.It.isValue(FIND_MY_SPAWNS)))
                .returns(() => [_spawn.object]);

            _spawner = new CreepSpawner(_room.object);
        });

        it("calls spawnCreep", () => {
            _spawner.run();

            _spawn.verify(s => s.spawnCreep(TypeMoq.It.isAny(), TypeMoq.It.isAny()), TypeMoq.Times.once());
        });
    })
});
