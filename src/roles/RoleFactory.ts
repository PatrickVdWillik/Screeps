import { Miner } from "./Miner";
import { Truck } from "./Truck";

export class RoleFactory {
    private constructor() { }

    public static create(creep: Creep): IRunnable {
        switch (creep.memory.role) {
            case "Miner":
                return new Miner(creep);
            case "Truck":
                return new Truck(creep);
        }

        throw new Error(`Unexpected role found: ${creep.memory.role}`);
    }
}
