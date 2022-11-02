import { RootState } from "./StateController";
export { applyRdtLogging };
/*
 * Redux Dev Tools
 *
 * Docs:
 * https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Methods.md
 */
let _rdtLogger = undefined;
/**
 * Logs root state changes to redux dev tools
 * and pushes previous state snapshots from rdt
 * to the root state and any connected controllers
 * @param name the name of the dev tools instance
 */
const applyRdtLogging = (name) => {
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
    constructor(rdtExtension, name) {
        this.rdtExtension = rdtExtension;
        this.rdt = this.connectToDevTools(name);
        this.listenForRootstateChanges();
    }
    /**
     * Calls connect on the dev tools instance
     * @param name the dev tools instance name
     */
    connectToDevTools(name) {
        const dt = this.rdtExtension.connect({ name });
        dt.init(RootState.current);
        dt.subscribe(this.updateFromDevTools);
        return dt;
    }
    ;
    listenForRootstateChanges() {
        RootState.addRootStateChangeEventListener((event) => this.rdt.send(this.getDevToolsActionFromEvent(event.event), event.rootState));
    }
    getDevToolsActionFromEvent(event) {
        if (typeof event === "string") {
            return { type: event };
        }
        const action = JSON.parse(JSON.stringify(event));
        delete action.isTrusted;
        action.type = event.type;
        return action;
    }
    updateFromDevTools(data) {
        // return if initializing
        if (data.type === "START" || data.payload.type === "IMPORT_STATE") {
            return;
        }
        if (this.canHandleUpdate(data)) {
            RootState.push(data.state);
        }
        else {
            this.rdt.error(`DataElement RDT logging does not support payload type: ${data.type}:${data.payload.type}`);
        }
    }
    /**
     * Returns true if we can handle the data update from dev tools
     * @param data
     * @returns {boolean}
     */
    canHandleUpdate(data) {
        return data.type === "DISPATCH" && (data.payload.type === "JUMP_TO_ACTION" ||
            data.payload.type === "JUMP_TO_STATE");
    }
}
//# sourceMappingURL=applyRdtLogging.js.map