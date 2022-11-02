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
/**
 * Class used to track root state changes
 */
export declare class RootState {
    private static bus;
    private static listenerCounts;
    static addStateChangeEventListener(statePath: string, listener: StateChangeEventListener, signal: AbortSignal): void;
    static addRootStateChangeEventListener(listener: RootStateChangeEventListener, signal?: AbortSignal): void;
    static get<T>(name: string): T | null;
    static change<T>(controller: any, event: Event | string, statePath: string, state: T): true;
    static push(state: RootStateContainer): void;
    static get current(): RootStateContainer;
}
export declare class StateController implements ReactiveController {
    [name: string]: any;
    /** Returns the stateId property from the host element if defined */
    get stateId(): string | null;
    /**
     * Initializes the StateController
     */
    constructor(host: LitElement);
    /** The element that the controller is attached to */
    host: LitElement & {
        stateId?: string;
    };
    /** An array of state property names */
    stateProperties: Array<string>;
    /** Used to signal when the host has been disconnected */
    abortController: AbortController;
    /** Adds a state property name to track; can also use the @{link trackState} decorator */
    trackState(name: string): void;
    /**
     * Notifies the root state of the change and calls requestUpdate on the host.
     * @param event The event responsible for the update
     */
    requestUpdate(event: Event | string): void;
    hostConnected(): void;
    hostDisconnected(): void;
    private initState;
    private syncStateValue;
    private addStateListeners;
    private getStateName;
}
export {};
//# sourceMappingURL=StateController.d.ts.map