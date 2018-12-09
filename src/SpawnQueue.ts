export enum QueuePriority {
    //Low,
    Normal,
    //Important,
    Critical
}

export interface SpawnRequest {
    role: string;
    priority: QueuePriority;
    idealSize: boolean;
    body?: BodyPartConstant[];
    memory?: any;
}

export interface ISpawnQueue {
    readonly length: number;
    peek(): SpawnRequest | null;
    completeRequest(): void;
}

export class SpawnQueue implements ISpawnQueue {

    public get length(): number {
        return 0;
    }

    public peek(): SpawnRequest | null {
        throw new Error("Method not implemented.");
    }

    public completeRequest(): void {
        throw new Error("Method not implemented.");
    }
}