export { applyRdtLogging };
/**
 * Logs root state changes to redux dev tools
 * and pushes previous state snapshots from rdt
 * to the root state and any connected controllers
 * @param name the name of the dev tools instance
 */
declare const applyRdtLogging: (name?: string) => void;
interface DevToolsExtension {
    /** Creates a new dev tools extension instance. */
    connect({ name }: {
        name?: string;
    }): DevToolsInstance;
}
interface DevToolsInstance {
    /** Sends the initial state to the monitor. */
    init(state: any): void;
    /**
     * Adds a change listener. It will be called any time an action
     * is dispatched from the monitor. Returns a function to
     * unsubscribe the current listener.
     */
    subscribe(listener: Function): void;
    /** Unsubscribes all listeners. */
    unsubscribe(): void;
    /** Sends a new action and state manually to be shown on the monitor. */
    send(action: DevToolsAction | string, state: any): void;
    /** Sends the error message to be shown in the extension's monitor. */
    error(message: string): void;
}
interface DevToolsAction {
    type: string;
}
declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: DevToolsExtension;
    }
}
//# sourceMappingURL=applyRdtLogging.d.ts.map