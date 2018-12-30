export enum QueuePriority {
    //Low,
    Normal,
    //Important,
    Critical
}

export interface SpawnRequest {
    role: string;
    priority: QueuePriority;
    details: SpawnDetails;
    body?: BodyPartConstant[];
}

export interface SpawnDetails {
    maxCost: number;
    memory?: any;
    work?: number;
    carry?: number;
    move?: number;
    tough?: number;
}

export interface ISpawnQueue {
    readonly length: number;
    peek(): SpawnRequest | null;
    completeRequest(): void;
    push(role: string, details: SpawnDetails, priority: QueuePriority): void;
    getRequestCount(role: string): number;
}

export class SpawnQueue implements ISpawnQueue {
    public constructor(private _memory: SpawnRequest[]) {
    }

    public get length(): number {
        return this._memory.length;
    }

    public peek(): SpawnRequest | null {
        if (this._memory.length > 0) {
            return this._memory[0];
        }

        return null;
    }

    public completeRequest(): void {
        this._memory.splice(0, 1);
    }

    public push(role: string, details: SpawnDetails, priority: QueuePriority, memory?: any): void {
        this._memory.push({
            role: role,
            priority: priority,
            details: details
        });

        this._memory = _.sortBy(this._memory, r => r.priority);
    }

    public getRequestCount(role: string): number {
        return _.filter(this._memory, r => r.role === role).length;
    }
}
