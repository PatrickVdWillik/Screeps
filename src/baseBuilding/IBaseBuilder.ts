export interface IBaseBuilder {
    run(): void;

    readonly isComplete: boolean;
}
