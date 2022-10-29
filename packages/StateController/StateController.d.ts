import { LitElement, ReactiveController } from "lit";
export declare class RootStateChangeEvent extends Event {
    static eventType: string;
    event: Event | string;
    rootState: RootStateContainer;
    controller: any;
    statePath: string;
    state: any;
    constructor(event: Event | string, rootState: RootStateContainer, controller: any, statePath: string, state: any);
}
declare class StatePathChangeEvent extends Event {
    controller: any;
    statePath: string;
    state: any;
    constructor(controller: any, statePath: string, state: any);
}
declare type RootStateContainer = {
    [key: string]: any;
};
declare type StateChangeEventListener = (event: StatePathChangeEvent) => void;
declare type RootStateChangeEventListener = (event: RootStateChangeEvent) => void;
export declare class RootState {
    private static bus;
    private static listenerCounts;
    static addStateChangeEventListener(statePath: string, listener: StateChangeEventListener, signal: AbortSignal): void;
    static addRootStateChangeEventListener(listener: RootStateChangeEventListener, signal?: AbortSignal): void;
    static get<T>(name: string): T | null;
    static change<T>(controller: any, event: Event | string, statePath: string, state: T): true;
    static get current(): RootStateContainer;
}
export declare class StateController implements ReactiveController {
    [name: string]: any;
    get stateId(): string | null;
    constructor(host: LitElement);
    host: LitElement & {
        stateId?: string;
    };
    stateProperties: Array<string>;
    abortController: AbortController;
    trackState(name: string): void;
    hostConnected(): void;
    requestUpdate(event: Event | string): void;
    hostDisconnected(): void;
    private initState;
    private syncStateValue;
    private addStateListeners;
    private getStateName;
}
export {};
//# sourceMappingURL=StateController.d.ts.map