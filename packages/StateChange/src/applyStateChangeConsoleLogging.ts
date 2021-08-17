import {StateChange} from "./StateChange";
import {Logger} from "@plotmap/middleware";
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

    StateChange.applyNextMiddleware((stateChange:StateChange)  => (next:Function) => (state:any) =>{
        const {el, className, nextName, tapName} = stateChange.meta;
        Logger.log(el, collapsed ? "groupCollapsed" : "group", `> STATECHANGE.next: ${className}.${tapName ? `${tapName}(${nextName})` : `${nextName}()`}`);
        const result = next(state);
        Logger.log(el, "info", `> STATECHANGE next state:`, result);
        Logger.log(el, "groupEnd");
        return result;
    });
};


/**
 * Exposed for testing
 */
 applyStateChangeConsoleLogging.reset = () => {
    isApplied = false;
};