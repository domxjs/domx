import { LitElement, ReactiveController } from "lit";
export declare class StateController implements ReactiveController {
    [name: string]: any;
    get stateId(): string | null;
    constructor(host: LitElement);
    host: LitElement & {
        stateId?: string;
    };
    private stateProperties;
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
//# sourceMappingURL=StateController.d.ts.map