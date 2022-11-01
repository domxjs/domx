import { RootState, RootStateChangeEvent } from "./StateController";
export { applyRdtLogging }

/*
 * Redux Dev Tools
 * 
 * Docs:
 * https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Methods.md
 */


let _rdtLogger:RdtLogger|null|undefined = undefined;


/**
 * Logs root state changes to redux dev tools
 * and pushes previous state snapshots from rdt
 * to the root state and any connected controllers
 * @param name the name of the dev tools instance
 */
const applyRdtLogging = (name?:string):void => {

    // singleton; return if defined
    if (_rdtLogger !== undefined) {
        return;
    }

    // set the logger to null if no extension is installed
    // otherwise create the logger
    _rdtLogger = !window.__REDUX_DEVTOOLS_EXTENSION__ ? null :
        new RdtLogger(window.__REDUX_DEVTOOLS_EXTENSION__, name);
};


class RdtLogger {
    rdtExtension:DevToolsExtension;
    rdt:DevToolsInstance;

    constructor(rdtExtension:DevToolsExtension, name?:string, ) {
        this.rdtExtension = rdtExtension;
        this.rdt = this.connectToDevTools(name);
        this.listenForRootstateChanges();
    }

    /**
     * Calls connect on the dev tools instance
     * @param name the dev tools instance name
     */
    private connectToDevTools(name?:string):DevToolsInstance {
        const dt =  this.rdtExtension.connect({name});
        dt.init(RootState.current);
        dt.subscribe(this.updateFromDevTools);
        return dt;
    };

    private listenForRootstateChanges() {
        RootState.addRootStateChangeEventListener((event:RootStateChangeEvent) =>
            this.rdt.send(this.getDevToolsActionFromEvent(event.event), event.rootState));
    }

    private getDevToolsActionFromEvent(event:Event|string):DevToolsAction {
        if (typeof event === "string") {
            return { type: event };
        }
        const action = JSON.parse(JSON.stringify(event));
        delete action.isTrusted;
        action.type = event.type;
        return action;
    }

    private updateFromDevTools(data:DevToolsEventData) {

        // return if initializing
        if (data.type === "START" || data.payload.type === "IMPORT_STATE") {
            return;
        }
    
        if (this.canHandleUpdate(data)) {
            RootState.push(data.state);
        } else {
            this.rdt.error(`DataElement RDT logging does not support payload type: ${data.type}:${data.payload.type}`);
        }
    }

    /**
     * Returns true if we can handle the data update from dev tools
     * @param data
     * @returns {boolean}
     */
    private canHandleUpdate(data:DevToolsEventData):boolean {
        return data.type === "DISPATCH" && (
            data.payload.type === "JUMP_TO_ACTION" ||
            data.payload.type === "JUMP_TO_STATE"
        );
    }
}



 
interface DevToolsExtension {
    /** Creates a new dev tools extension instance. */
    connect({name}:{name?:string}):DevToolsInstance
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
    send(action:DevToolsAction|string, state:any): void,
    /** Sends the error message to be shown in the extension's monitor. */
    error(message:string): void
}


interface DevToolsAction {
    type: string
}


interface DevToolsEventData {
    id:string,
    /**
     * "START" - on RDT init
     * "DISPATCH" - when dispatching
     */
    type: string,
    payload: {
        /**
         * JUMP_TO_ACTION - can change state here
         * TOGGLE_ACTION - dont support toggle
         */
        type: string
    },
    state: any
}


declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: DevToolsExtension;
    }
}
