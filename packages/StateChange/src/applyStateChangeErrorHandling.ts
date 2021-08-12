import {StateChange} from "./StateChange";
import {Logger} from "@harbr/middleware";
export { applyStateChangeErrorHandling };

let isApplied = false;


/**
 * Adds error catching middleware to StateChange.
 */
const applyStateChangeErrorHandling = () => {
    if (isApplied) {
        console.warn("applyStateChangeErrorHandling has already been called.");
        return;
    }
    isApplied = true;
    
    StateChange.applyNextMiddleware((stateChange:StateChange)  => (next:Function) => (state:any) =>
        catchErrors(stateChange, next, state));

    StateChange.applyTapMiddleware((next:Function) => (stateChange:StateChange) =>
        catchErrors(stateChange, next, stateChange));
};


const catchErrors = (stateChange:StateChange, next:Function, stateOrStateChange:any) => {
    try {
        return next(stateOrStateChange);
    } catch (error) {
        const {el} = stateChange.meta;
        Logger.log(el, "error", "StateChange error!", error);
        throw error;
    }
};

/**
 * Exposed for testing
 */
 applyStateChangeErrorHandling.reset = () => {
    isApplied = false;
};
  