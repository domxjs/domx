import {StateChange} from "./StateChange";
import {Logger} from "@harbr/middleware";
export { applyStateChangeConsoleLogging };


/**
 * Adds logging logging middleware to StateChange.
 */
const applyStateChangeConsoleLogging = () => {
    StateChange.applyNextMiddleware((stateChange:StateChange)  => (next:Function) => (state:any) =>{
        insertLogger(stateChange, next, state);
    });

    StateChange.applyTapMiddleware((next:Function) => (stateChange:StateChange) =>{
        insertLogger(stateChange, next, stateChange);
    });
};



 const insertLogger = (stateChange:StateChange, next:Function, stateOrStateChange:any) => {
    const fnName = next.name || "anonymous";
    const {el} = stateChange.meta;
    const isTap = stateOrStateChange instanceof StateChange;
    isTap ?
        Logger.log(el, "group", `> STATECHANGE.tap: ${el.constructor.name}.${fnName}()`) :
        Logger.log(el, "groupCollapsed", `> STATECHANGE.next: ${el.constructor.name}.${fnName}()`);
    const result = next(stateOrStateChange);
    !isTap && Logger.log(el, "info", `> STATECHANGE next state:`, result);
    Logger.log(el, "groupEnd");
    return result
};