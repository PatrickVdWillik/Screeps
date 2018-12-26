import { AbstractBuilder } from "./AbstractBuilder";

export class RoomPosBuilder extends AbstractBuilder<RoomPosition> {
    private constructor(private _x: number, private _y: number, private _roomName?: string) {
        super();
    }

    public static create(x: number, y: number, roomName?: string): RoomPosBuilder {
        return new RoomPosBuilder(x, y, roomName);
    }

    public build(): RoomPosition {
        const x = this._x;
        const y = this._y;

        return ({
            x: this._x,
            y: this._y,
            roomName: this._roomName || "test",
            getRangeTo(target: RoomPosition | { pos: RoomPosition }): number {
                if ((<{ pos: RoomPosition }>target).pos) {
                    return this.getRangeTo((<{ pos: RoomPosition }>target).pos);
                } else {
                    const dX = x - (<RoomPosition>target).x;
                    const dY = y - (<RoomPosition>target).y;
                    return Math.sqrt(dX * dX + dY * dY);
                }
            }
        }) as RoomPosition;
    }
}
