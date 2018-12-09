import * as TypeMoq from "typemoq";

export class AbstractBuilder<T> {
    protected _mock: TypeMoq.IMock<T> = TypeMoq.Mock.ofType<T>();

    protected constructor() { }

    public get mock(): TypeMoq.IMock<T> {
        return this._mock;
    }
}
