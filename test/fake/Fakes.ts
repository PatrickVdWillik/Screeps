abstract class StructureFake<T extends StructureConstant = StructureConstant> implements Structure<T> {
    private _id: string;
    private _hits: number;
    private _hitsMax: number;
    private _pos: RoomPosition;
    private _room: Room;    
    private _name: string;
    
    public readonly prototype: Structure<T>;
    
    public abstract readonly structureType: T;
    
    public get hitsMax(): number {
        return SPAWN_HITS;
    }
    
    public set hitsMax(value: number)  {
        this._hitsMax = value;
    }  
    
    public get hits(): number {
        return this._hits;
    }
    
    public set hits(value: number)  {
        this._hits = value;
    }
    
    public get id(): string { 
        return this._id;
    }
    
    public set id(value: string) {
        this._id = value;
    }    
    
    public get room(): Room {
        return this._room;
    }
    
    public set room(value: Room) {
        this._room = value;
    }
    
    public get pos(): RoomPosition {
        return this._pos;
    }
    
    public set pos(value: RoomPosition) {
        this._pos = value;
    }
    
    public get name(): string {
        return this._name;
    }
    
    public set name(value: string) {
        this._name = value;
    }
    
    public destroy(): ScreepsReturnCode {
        return OK;
    }
    
    public isActive(): boolean {
        return true;
    }
    
    public notifyWhenAttacked(enabled: boolean): ScreepsReturnCode {
        return OK;
    }    
}

abstract class OwnedStructureFake<T extends StructureConstant = StructureConstant> extends StructureFake<T> implements OwnedStructure<T> {
    public readonly prototype: OwnedStructure<T>;
    
    public get owner(): Owner {
        return { username: "owner" } as Owner;
    }
    
    public get my(): boolean {
        return true;
    }    
}

export class StructureSpawnFake extends OwnedStructureFake<STRUCTURE_SPAWN> implements StructureSpawn {
    public readonly prototype: StructureSpawn;
    
    private _energyCapacity: number = SPAWN_ENERGY_CAPACITY;
    private _energy: number = 0;

    private _memory: SpawnMemory = {} as SpawnMemory;
    
    public StructureSpawnFake() {
        this.hits = SPAWN_HITS;
        this.hitsMax = SPAWN_HITS;
    }
    
    public get structureType(): STRUCTURE_SPAWN {
        return STRUCTURE_SPAWN;
    }

    public get energyCapacity(): number {
        return SPAWN_ENERGY_CAPACITY;
    }
    public get energy(): number {
        return this._energy;
    }
    
    public set energy(value: number) {
        this._energy = value;
    }
    
    public get memory(): SpawnMemory {
        return this._memory;
    }
    
    public set memory(value: SpawnMemory) {
        this._memory = value;
    }
    
    public get spawning(): Spawning | null {
        return null;
    }
    
    public canCreateCreep(body: BodyPartConstant[], name?: string): ScreepsReturnCode {
        return OK;
    }
    
    public createCreep(body: BodyPartConstant[], name?: string, memory?: CreepMemory): ScreepsReturnCode | string {
        return OK;
    }
    
    public spawnCreep(body: BodyPartConstant[], name: string, opts?: SpawnOptions): ScreepsReturnCode {
        return OK;
    }
 
    public renewCreep(target: Creep): ScreepsReturnCode {
        return OK;
    }
    
    public recycleCreep(target: Creep): ScreepsReturnCode {
        return OK;
    }
}

export class StructureExtensionFake extends OwnedStructureFake<STRUCTURE_EXTENSION> implements StructureExtension {
    public readonly prototype: StructureExtension;
    
    private _energyCapacity: number = 50;
    private _energy: number = 0;
    
    public ExtensionFake() {
        this.hits = EXTENSION_HITS;
        this.hitsMax = EXTENSION_HITS;
    }
    
    public get structureType(): STRUCTURE_EXTENSION {
        return STRUCTURE_EXTENSION;
    }

    public get energyCapacity(): number {
        return this._energyCapacity; // TODO: Implement Support for RCL related size
    }
    public get energy(): number {
        return this._energy;
    }
    
    public set energy(value: number) {
        this._energy = value;
    } 
}