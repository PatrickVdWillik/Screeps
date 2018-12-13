import { StructureSpawnFake, StructureExtensionFake } from "./Fakes";

export class SpawnFakeBuilder {
    private _fake: StructureSpawnFake = new StructureSpawnFake();
    
    private constructor() {
    }
    
    public static create(): SpawnFakeBuilder {
        return new SpawnFakeBuilder();
    }
    
    public withEnergy(amount: number): SpawnFakeBuilder {
        this._fake.energy = amount;
        
        return this;
    }
    
    public withHits(amount: number): SpawnFakeBuilder {
        this._fake.hits = amount;
        
        return this;
    }
    
    public withId(id: string): SpawnFakeBuilder {
        this._fake.id = id;
        
        return this;
    }

    public build(): StructureSpawn {
        return this._fake;
    }
}

export class ExtensionFakeBuilder {
    private _fake: StructureExtensionFake = new StructureExtensionFake();
    
    private constructor() {
    }
    
    public static create(): ExtensionFakeBuilder {
        return new ExtensionFakeBuilder();
    }
    
    public withEnergy(amount: number): ExtensionFakeBuilder {
        this._fake.energy = amount;
        
        return this;
    }
    
    public withHits(amount: number): ExtensionFakeBuilder {
        this._fake.hits = amount;
        
        return this;
    }
    
    public withId(id: string): ExtensionFakeBuilder {
        this._fake.id = id;
        
        return this;
    }

    public build(): StructureExtension {
        return this._fake;
    }    
}