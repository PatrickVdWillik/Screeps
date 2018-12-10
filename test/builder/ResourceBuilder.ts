import { IMock, Mock } from "typemoq";
import { AbstractBuilder } from "./AbstractBuilder";

export class ResourceBuilder extends AbstractBuilder<Resource> {
    private constructor() {
        super();
    }
    
    public static create(): ResourceBuilder {
        return new ResourceBuilder();
    }
    
    public inRoom(room: Room): ResourceBuilder {
        this.mock.setup(r => r.room).returns(() => room);
        
        return this;
    }
    
    public atPos(x: number, y: number): ResourceBuilder {
        const pos: IMock<RoomPosition> = Mock.ofType<RoomPosition>();
        pos.setup(p => p.x).returns(() => x);
        pos.setup(p => p.y).returns(() => y);
        
        this.mock.setup(r => r.pos).returns(() => pos.object);
        
        return this;
    }
    
    public ofResourceType(type: ResourceConstant): ResourceBuilder {
        this.mock.setup(r => r.resourceType).returns(() => type);
        
        return this;
    }
    
    public withAmount(amount: number): ResourceBuilder {
        this.mock.setup(r => r.amount).returns(() => amount);
        
        return this;
    }
    
    public withId(id: string): ResourceBuilder {
        this.mock.setup(r => r.id).returns(() => id);
        
        return this;
    }
    
    public build(): Resource {
        return this.mock.object;
    }
}