export abstract class Base {
    protected abstract get name(): string|undefined;
    protected abstract create<T>(...args: any[]): T
}