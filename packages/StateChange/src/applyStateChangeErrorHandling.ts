import {StateChange} from "./StateChange";
import {Logger} from "@harbr/middleware";
export { applyStateChangeErrorHandling };


/**
 * Adds error catching middleware to StateChange.
 */
const applyStateChangeErrorHandling = () => {
    StateChange.applyNextMiddleware((stateChange:StateChange)  => (next:Function) => (state:any) =>{
        catchErrors(stateChange, next, state);
    });

    StateChange.applyTapMiddleware((next:Function) => (stateChange:StateChange) =>{
        catchErrors(stateChange, next, stateChange);
    });
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
  