import * as TypeMoq from "typemoq";

export abstract class AbstractBuilder<T> {
    protected _mock: TypeMoq.IMock<T>;

    protected constructor(mockBehavior: TypeMoq.MockBehavior) {
        this._mock = TypeMoq.Mock.ofType<T>();
    }

    public get mock(): TypeMoq.IMock<T> {
        return this._mock;
    }

    public abstract build(): T;
}
