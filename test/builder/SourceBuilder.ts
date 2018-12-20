import { AbstractBuilder } from "./AbstractBuilder";

export class SourceBuilder : AbstractBuilder<Source> {
    private constructor() {
    }
    
    public static create(): SourceBuilder {
        return new SourceBuilder();
    }
    
    public withId(value: string): SourceBuilder {
        this.mock.setup(s => s.id).returns(() => value);
        
        return this;
    }
    
    public withEnergyCapacity(value: number): SourceBuilder {
        this.mock.set
        up(s => s.energyCapacity).returns(() => value);
        
        return this;
    }
    
    public withEnergy(value: number): SourceBuilder {
        this.mock.setup(s => s.energy).returns(() => value); 
        
        return this;
    }
}