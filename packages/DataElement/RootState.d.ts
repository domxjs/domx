export { RootState };
interface StateMap {
    [key: string]: StateMap | undefined;
}
declare class RootState {
    static get(path: string): object | null;
    static set(path: string, value: object | undefined): void;
    static delete(path: string): void;
    static get current(): StateMap;
    static clear(): void;
}
//# sourceMappingURL=RootState.d.ts.map