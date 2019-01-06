import { IColony } from "Colony";

export interface BaseMemory {
    sourceContainers: { [key: string]: string | undefined };
    controllerContainer: string;
    spawnContainer: string;
    spawns: string[];
}

export class Base {
    private _lastTickSearched: number;
    private _sourceContainers: { [key: string]: StructureContainer } = {};
    private _spawns: StructureSpawn[];

    public constructor(private _colony: IColony, private _memory: BaseMemory) {
    }

    public getSourceContainer(source: string | Source): StructureContainer | null {
        if (source instanceof Source) source = source.id;

        if (this._sourceContainers[source]) {
            return this._sourceContainers[source];
        }

        if (this._memory.sourceContainers && this._memory.sourceContainers[source]) {
            const container = Game.getObjectById<StructureContainer>(source)!;
            if (!container) {
                this._memory.sourceContainers[source] = undefined;
                return null;
            }

            this._sourceContainers[source] = container;
            return container;
        }

        return null;
    }

    public get spawns(): StructureSpawn[] {
        if (this._spawns) {
            return this._spawns;
        }

        this._spawns = this._colony.mainRoom.find(FIND_MY_SPAWNS);
        return this._spawns;
    }

    public get spawnContainer(): StructureContainer | null {
        return null;
    }

    public get controllerController(): StructureContainer | null {
        return null;
    }
}
