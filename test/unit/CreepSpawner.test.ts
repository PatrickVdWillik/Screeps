import * as TypeMoq from "typemoq";
import { CreepSpawner } from "../../src/CreepSpawner";
import { ISpawnQueue, SpawnRequest, QueuePriority } from "../../src/SpawnQueue";
import { ICreepBuilder } from "../../src/CreepBuilder";
import { RoomBuilder } from "../builder/RoomBuilder";
import { SpawnBuilder } from "../builder/SpawnBuilder";

describe("CreepSpawner", () => {
    let _room: RoomBuilder;
    let _spawnQueue: TypeMoq.IMock<ISpawnQueue>;
    let _creepBuilder: TypeMoq.IMock<ICreepBuilder>;

    function getSpawner(): CreepSpawner {
        return new CreepSpawner(_room.build(), _spawnQueue.object, _creepBuilder.object);
    }

    beforeEach(() => {
        _room = RoomBuilder.create();
        _spawnQueue = TypeMoq.Mock.ofType<ISpawnQueue>();
        _creepBuilder = TypeMoq.Mock.ofType<ICreepBuilder>();
    });

    describe("without a spawn request", () => {
        beforeEach(() => {
            _spawnQueue.setup(s => s.length).returns(s => 0);
        });

        it("won't call completeRequest()", () => {
            getSpawner().run();

            _spawnQueue.verify(s => s.completeRequest(), TypeMoq.Times.never());
        });
    });

    describe("with a spawn request", () => {
        let _spawnBuilder: SpawnBuilder;
        let _spawnRequest: SpawnRequest = {
            role: "Worker",
            priority: QueuePriority.Normal,
            idealSize: true,
            body: [WORK, MOVE, CARRY]
        };

        beforeEach(() => {
            _spawnBuilder = SpawnBuilder.create();
            _spawnQueue.setup(s => s.length).returns(s => 1);
            _spawnQueue.setup(s => s.peek())
                .returns(s => _spawnRequest);
        });

        it("will filter away spawns that are spawning", () => {
            _room.withSpawnBuilder(_spawnBuilder);
            _spawnBuilder.isSpawning({} as Spawning);

            getSpawner().run();

            _spawnBuilder.mock.verify(s => s.spawnCreep(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()), TypeMoq.Times.never());
        });

        describe("without any available spawns", () => {
            it("won't call completeRequest", () => {
                _room.withSpawn(b => b.isSpawning({} as Spawning));

                getSpawner().run();

                _spawnQueue.verify(s => s.completeRequest(), TypeMoq.Times.never());
            });
        });

        describe("with available spawn and successful spawnCreep() call", () => {
            beforeEach(() => {
                _room.withSpawnBuilder(_spawnBuilder);
                _spawnBuilder
                    .isNotSpawning()
                    .spawnCreep(OK);
            });

            it("will call spawnCreep once", () => {
                getSpawner().run();

                _spawnBuilder.mock.verify(s => s.spawnCreep(TypeMoq.It.isValue(_spawnRequest.body!), TypeMoq.It.isAnyString(), TypeMoq.It.isObjectWith({
                    memory: {
                        role: _spawnRequest.role
                    } as CreepMemory
                })), TypeMoq.Times.once());
            });

            it("will completeRequest", () => {
                getSpawner().run();

                _spawnQueue.verify(q => q.completeRequest(), TypeMoq.Times.once());
            })
        });

        describe("with available spawn and not enough Energy", () => {
            beforeEach(() => {
                _room.withSpawnBuilder(_spawnBuilder);
                _spawnBuilder
                    .isNotSpawning()
                    .spawnCreep(ERR_NOT_ENOUGH_ENERGY);
            });

            it("won't completeRequest()", () => {
                getSpawner().run();

                _spawnQueue.verify(q => q.completeRequest(), TypeMoq.Times.never());
            });
        });

        describe("with a spawnRequest without a body", () => {
            const _creepBody = [WORK, CARRY, MOVE, MOVE];
            beforeEach(() => {
                _spawnRequest.body = undefined;

                _creepBuilder.setup(b => b.buildBody(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
                    .returns(b => _creepBody);
                _room.withSpawnBuilder(_spawnBuilder);
                _spawnBuilder.isNotSpawning().spawnCreep(OK);
            });

            it("will call the creepBuilder", () => {
                getSpawner().run();

                _spawnBuilder.mock.verify(s => s.spawnCreep(TypeMoq.It.isValue(_creepBody), TypeMoq.It.isAnyString(), TypeMoq.It.isAny()), TypeMoq.Times.once());
            });
        })
    });
});
