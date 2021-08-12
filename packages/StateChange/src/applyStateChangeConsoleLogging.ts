import {StateChange} from "./StateChange";
import {Logger} from "@harbr/middleware";
export { applyStateChangeConsoleLogging };


let isApplied = false;


/**
 * Adds logging logging middleware to StateChange.
 */
const applyStateChangeConsoleLogging = ({collapsed}:{collapsed:boolean} = {collapsed:false}) => {
    if (isApplied) {
        console.warn("applyStateChangeConsoleLogging has already been called.");
        return;
    }
    isApplied = true;

    StateChange.applyNextMiddleware((stateChange:StateChange)  => (next:Function) => (state:any) =>
        insertLogger(stateChange, next, state, collapsed));

    StateChange.applyTapMiddleware((next:Function) => (stateChange:StateChange) =>
        insertLogger(stateChange, next, stateChange, collapsed));
};



 const insertLogger = (stateChange:StateChange, next:Function, stateOrStateChange:any, collapsed: boolean) => {
    const fnName = getFnName(stateChange, next);
    const {el} = stateChange.meta;
    const isTap = stateOrStateChange instanceof StateChange;
    isTap ?
        Logger.log(el, "group", `> STATECHANGE.tap: ${fnName}`) :
        Logger.log(el, collapsed ? "groupCollapsed" : "group", `> STATECHANGE.next: ${fnName}`);
    const result = next(stateOrStateChange);
    !isTap && Logger.log(el, "info", `> STATECHANGE next state:`, result);
    Logger.log(el, "groupEnd");
    return result
};


const getFnName = (stateChange:StateChange, next:Function) => {
    let fnName = next.name || "anonymous";
    if (fnName.indexOf("2") === fnName.length-1) {
        fnName = fnName.substring(0, fnName.length - 1);
    }
    return `${stateChange.meta.el.constructor.name}.${fnName}()`;
};


/**
 * Exposed for testing
 */
 applyStateChangeConsoleLogging.reset = () => {
    isApplied = false;
};