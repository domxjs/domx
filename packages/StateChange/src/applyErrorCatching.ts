import {StateChange} from "./StateChange";
import {Logger} from "@harbor/middleware";
export { applyConsoleLogging };


/**
 * Adds error catching middleware to StateChange.
 */
const applyConsoleLogging = () => {
    StateChange.applyNextMiddleware((stateChange:StateChange)  => (next:Function) => (state:any) =>{
        catchErrors(stateChange, next, state);
    });

    StateChange.applyTapMiddleware((stateChange:StateChange)  => (next:Function) => (stateChange:StateChange) =>{
        catchErrors(stateChange, next, stateChange);
    });
};


const catchErrors = (stateChange:StateChange, next:Function, stateOrStateChange:any) => {
    try {
        return next(stateOrStateChange);
    } catch (error) {
        const {el} = stateChange.meta;
        Logger.log(el, "error", "PIPESTATE error!", error);
        throw (error);
    }
};
  