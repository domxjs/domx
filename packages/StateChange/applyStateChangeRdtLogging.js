import { StateChange } from "./StateChange";
export { applyStateChangeRdtLogging };
/**
 * Redux Dev Tools Middleware
 *
 * Docs:
 * https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Methods.md
 */
const applyStateChangeRdtLogging = () => {
    StateChange.applyNextMiddleware((stateChange) => (next) => (state) => {
        return tryLogToDevTools(stateChange, next, state);
    });
    StateChange.applyTapMiddleware((next) => (stateChange) => {
        return tryLogToDevTools(stateChange, next, stateChange);
    });
};
const tryLogToDevTools = (stateChange, next, stateOrStateChange) => {
    const result = next(stateOrStateChange);
    const isTap = stateOrStateChange instanceof StateChange;
    hasDevTools() && logToDevTools(stateChange, next, isTap ? stateChange.getState() : result);
    return result;
};
const logToDevTools = (stateChange, next, result) => {
    const fnName = next.name || "anonymous";
    const dt = getDevToolsInstance(stateChange);
    const currentState = stateChange.getState();
    !stateChange.meta.el.__UPDATING_FROM_RDT &&
        dt.send(`${stateChange.meta.el.constructor.name}.${fnName}`, result);
};
const hasDevTools = () => window.__REDUX_DEVTOOLS_EXTENSION__ !== undefined;
const getDevTools = () => window.__REDUX_DEVTOOLS_EXTENSION__;
const getDevToolsInstance = (stateChange) => {
    const el = stateChange.meta.el;
    el.__rdt = el.__rdt || setupDevToolsInstance(stateChange);
    return el.__rdt;
};
const setupDevToolsInstance = (stateChange) => {
    const scMeta = stateChange.meta;
    const el = scMeta.el;
    const dt = getDevTools().connect({ name: el.constructor.name });
    dt.init(stateChange.getState());
    dt.subscribe((data) => {
        if (data.payload.type === "JUMP_TO_ACTION") {
            el.__UPDATING_FROM_RDT = true;
            StateChange.of(el, scMeta)
                .next(() => data.state)
                .dispatch();
            delete el.__UPDATING_FROM_RDT;
        }
        else {
            dt.error(`StateChange rdt logging does not support payload type: ${data.payload.type}`);
        }
    });
    return dt;
};
//# sourceMappingURL=applyStateChangeRdtLogging.js.map