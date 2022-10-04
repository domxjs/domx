import {StateChange} from "./StateChange";
import {Logger} from "@domx/middleware";
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
        const {el, className, nextName, tapName, property} = stateChange.meta;
        const stateName = property === "state" ? "state" : `state:${property}`;
        Logger.log(el, collapsed ? "groupCollapsed" : "group", `> STATECHANGE.next: ${className}.${tapName ? `${tapName}(${nextName})` : `${nextName}()`}`);
        const result = next(state);
        Logger.log(el, "info", `> STATECHANGE next ${stateName}:`, result);
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