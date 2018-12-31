// memory extension samples
interface CreepMemory {
  role: string;
  room: string;
}

declare enum QueuePriority {
  //Low, Normal,
  //Important,
  Critical
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    census: Record<string, Creep[]>;
    log: any;
  }
}

interface IRunnable {
  run(): void;
}
