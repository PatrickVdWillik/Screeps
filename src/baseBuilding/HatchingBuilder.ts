import { IColony } from "Colony";
import { IBaseBuilder } from "./IBaseBuilder";

export class HatchlingBuilder implements IBaseBuilder {
    public constructor(private _colony: IColony) {
    }

    public run(): void {
        const sources = this._colony.mainRoom.find(FIND_SOURCES);
        const spawn = this._colony.mainSpawn!;

        for (const source of sources) {
            let accessibleTiles = 0;
            let options: LookForAtAreaResultWithPos<Terrain, "terrain">[] = [];

            const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => s.structureType === STRUCTURE_CONTAINER
            });

            if (!_.isEmpty(containers)) {
                continue;
            }

            const constructionSites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                filter: s => s.structureType === STRUCTURE_CONTAINER
            });

            if (!_.isEmpty(constructionSites)) {
                continue;
            }

            const top = source.pos.y - 1;
            const bottom = source.pos.y + 1;
            const left = source.pos.x - 1;
            const right = source.pos.x + 1;
            const terrain = this._colony.mainRoom.lookForAtArea(LOOK_TERRAIN, top, left, bottom, right, true);

            for (const tile of terrain) {
                if (tile.x === source.pos.x && tile.y === source.pos.y) continue;

                if (tile.terrain === "plain" || tile.terrain === "swamp") {
                    const pos = this._colony.mainRoom.getPositionAt(tile.x, tile.y)!;
                    let count = 0;

                    for (const otherTile of terrain) {
                        if (otherTile.terrain === "wall") continue;

                        if (pos.getRangeTo(otherTile.x, otherTile.y) <= 1) count += 1;
                    }

                    if (count < accessibleTiles) continue;
                    if (count === accessibleTiles) options.push(tile);
                    if (count > accessibleTiles) {
                        options = [tile];
                        accessibleTiles = count;
                    }
                }
            }

            this._colony.mainRoom.visual.text(`${accessibleTiles}`, source.pos.x, source.pos.y, {
                color: "#ff0000"
            });

            const tile = _.min(options, tile => spawn.pos.getRangeTo(tile.x, tile.y));
            const result = this._colony.mainRoom.createConstructionSite(tile.x, tile.y, STRUCTURE_CONTAINER);
            if (result !== OK) {
                console.log(`HatchlingBuilder: Error placing container construction site at (${tile.x}, ${tile.y}). Result code: ${result}`);
            } else {
                console.log(`HatchlingBuilder: Container construction site at (${tile.x}, ${tile.y}) placed. Result code: ${result}`);
            }
        }
    }

    public get isComplete(): boolean {
        return false;
    }
}
