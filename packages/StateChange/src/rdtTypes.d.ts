export {DevToolsInstance, DevToolsExtension, DevToolsEventData};

interface DevToolsExtension {
    /** Creates a new dev tools extension instance. */
    connect({name}:{name:string}):DevToolsInstance
}

interface DevToolsInstance {
    /** Sends the initial state to the monitor. */
    init(state:any): void,
    /** 
     * Adds a change listener. It will be called any time an action
     * is dispatched from the monitor. Returns a function to
     * unsubscribe the current listener.
     */
    subscribe(listener:Function): void,
    /** Unsubscribes all listeners. */
    unsubscribe(): void,
    /** Sends a new action and state manually to be shown on the monitor. */
    send(action:string, state:any): void,
    /** Sends the error message to be shown in the extension's monitor. */
    error(message:string): void
}

interface DevToolsEventData {
    id:string,
    payload: {
        /**
         * JUMP_TO_ACTION - can change state here
         * TOGGLE_ACTION - dont support toggle
         */
        type: string
    },
    state: any
}
