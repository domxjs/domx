import {StateChange} from "./StateChange";
import {DevToolsEventData,DevToolsExtension,DevToolsInstance} from "./rdtTypes";
export {applyStateChangeRdtLogging};


/**
 * Redux Dev Tools Middleware
 * 
 * Docs:
 * https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Methods.md
 */
 const applyStateChangeRdtLogging = () => {
    StateChange.applyNextMiddleware((stateChange:StateChange)  => (next:Function) => (state:any) =>{
        return tryLogToDevTools(stateChange, next, state);
    });

    StateChange.applyTapMiddleware((next:Function) => (stateChange:StateChange) =>{
        return tryLogToDevTools(stateChange, next, stateChange);
    });
};

const tryLogToDevTools = (stateChange:StateChange, next:Function, stateOrStateChange:any) => {
    const result = next(stateOrStateChange);
    const isTap = stateOrStateChange instanceof StateChange;
    hasDevTools() && logToDevTools(stateChange, next, isTap ? stateChange.getState() : result);
    return result;
};


const logToDevTools = (stateChange:StateChange, next:Function, result:any) => {
    const fnName = next.name || "anonymous";
    const dt = getDevToolsInstance(stateChange);
    const currentState = stateChange.getState();

    !(stateChange.meta.el as any).__UPDATING_FROM_RDT &&
        dt.send(`${stateChange.meta.el.constructor.name}.${fnName}`, result);
};


const hasDevTools = () => (window as any).__REDUX_DEVTOOLS_EXTENSION__ !== undefined;

const getDevTools = ():DevToolsExtension => (window as any).__REDUX_DEVTOOLS_EXTENSION__;


const getDevToolsInstance = (stateChange: StateChange):DevToolsInstance => {
    const el = stateChange.meta.el as any;
    el.__rdt = el.__rdt || setupDevToolsInstance(stateChange); 
    return el.__rdt;
};


const setupDevToolsInstance = (stateChange: StateChange):DevToolsInstance => {
    const scMeta = stateChange.meta;
    const el = scMeta.el as any;
    const dt = getDevTools().connect({name:el.constructor.name});
    dt.init(stateChange.getState());
    dt.subscribe((data:DevToolsEventData) => {
        if (data.payload.type === "JUMP_TO_ACTION") {
            el.__UPDATING_FROM_RDT = true;
            StateChange.of(el, scMeta)
                .next(() => data.state)
                .dispatch();
            delete el.__UPDATING_FROM_RDT;
        } else {
            dt.error(`StateChange rdt logging does not support payload type: ${data.payload.type}`);
        }
    });
    return dt;
};
