import * as TypeMoq from "typemoq";

export abstract class AbstractBuilder<T> {
    protected _mock: TypeMoq.IMock<T> = TypeMoq.Mock.ofType<T>();

    protected constructor() { }

    public get mock(): TypeMoq.IMock<T> {
        return this._mock;
    }
    
    public abstract build(): T;
}
