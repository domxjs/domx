import {StateChange} from "./StateChange";
import {DevToolsEventData,DevToolsExtension,DevToolsInstance} from "./rdtTypes";
export {applyStateChangeRdtLogging};

let isApplied = false;


/**
 * Redux Dev Tools Middleware
 * 
 * Docs:
 * https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Methods.md
 */
 const applyStateChangeRdtLogging = () => {
    if (isApplied) {
        console.warn("applyStateChangeRdtLogging has already been called.");
        return;
    }
    isApplied = true;

    StateChange.applyNextMiddleware((stateChange:StateChange)  => (next:Function) => (state:any) =>
        tryLogToDevTools(stateChange, next, state));

    StateChange.applyTapMiddleware((next:Function) => (stateChange:StateChange) =>
        tryLogToDevTools(stateChange, next, stateChange));
};


/**
 * Logs to dev tools if the browser extension is installed.
 * @param stateChange {StateChange}
 * @param next {Function}
 * @param stateOrStateChange {any}
 * @returns {any} the result of the next function.
 */
const tryLogToDevTools = (stateChange:StateChange, next:Function, stateOrStateChange:any) => {
    const result = next(stateOrStateChange);
    const isTap = stateOrStateChange instanceof StateChange;
    hasDevTools() && logToDevTools(stateChange, next, isTap ? stateChange.getState() : result);
    return result;
};


/**
 * Logs to dev tools (if not updating from the dev tools listener).
 * @param stateChange {StateChange}
 * @param next {Function}
 * @param result {any}
 * @returns void
 */
const logToDevTools = (stateChange:StateChange, next:Function, result:any) => 
    !(stateChange.meta.el as any).__UPDATING_FROM_RDT &&
        getDevToolsInstance(stateChange).send(getFnName(stateChange, next), result);


/**
 * True if the redux dev tools extension is installed
 * @returns {boolean}
 */
const hasDevTools = ():boolean => (window as any).__REDUX_DEVTOOLS_EXTENSION__ !== undefined;


/**
 * Returns the redux dev tools extension
 * @returns {DevToolsExtension}
 */
const getDevTools = ():DevToolsExtension => (window as any).__REDUX_DEVTOOLS_EXTENSION__;


/**
 * Pulls the connected dev tools instance from the HTML Element.
 * Creates it if it does not exist.
 * @param stateChange {StateChange}
 * @returns {DevToolsInstance}
 */
const getDevToolsInstance = (stateChange: StateChange):DevToolsInstance => {
    const el = stateChange.meta.el as any;
    el.__rdt = el.__rdt || setupDevToolsInstance(stateChange); 
    return el.__rdt as DevToolsInstance;
};


/**
 * Creates the dev tools istance and sets up the 
 * listener for dev tools interactions.
 * @param stateChange {StateChange}
 * @returns DevToolsInstance
 */
const setupDevToolsInstance = (stateChange: StateChange):DevToolsInstance => {
    const scMeta = stateChange.meta;
    const el = scMeta.el as any;
    const dt = getDevTools().connect({name:el.constructor.name});
    dt.init(stateChange.getState());
    dt.subscribe((data:DevToolsEventData) => {
        if (isInit(data)) {
            return;
        }

        if (canHandleUpdate(data)) {
            el.__UPDATING_FROM_RDT = true;
            StateChange.of(el, scMeta)
                .next(() => JSON.parse(data.state))
                .dispatch();
            delete el.__UPDATING_FROM_RDT;
        } else {
            dt.error(`StateChange RDT logging does not support payload type: ${data.type}:${data.payload.type}`);
        }
    });
    return dt;
};


/**
 * Returns the name to log in the dev tools inspector.
 * @param stateChange {StateChange}
 * @param next {Function}
 * @returns {String}
 */
const getFnName = (stateChange:StateChange, next:Function):string => {
    let fnName = next.name || "anonymous";
    if(fnName.indexOf("2") === fnName.length -1) {
        fnName = fnName.substring(0, fnName.length - 1);
    }
    return `${stateChange.meta.el.constructor.name}.${fnName}()`;
};

/**
 * Returns true if the listener data is for initializing dev tools state.
 * @param data {DevToolsEventData}
 * @returns {boolean}
 */
const isInit = (data:DevToolsEventData):boolean => 
    data.type === "START" || data.payload.type === "IMPORT_STATE";


/**
 * Returns true if this middleware can handle the listener data.
 * @param data {DevToolsEventData}
 * @returns {boolean}
 */
const canHandleUpdate = (data:DevToolsEventData):boolean =>
    data.type === "DISPATCH" && (
        data.payload.type === "JUMP_TO_ACTION" ||
        data.payload.type === "JUMP_TO_STATE"
    );


/**
 * Exposed for testing
 */
 applyStateChangeRdtLogging.reset = () => {
    isApplied = false;
};