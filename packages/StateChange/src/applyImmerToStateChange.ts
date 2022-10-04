import {StateChange} from "./StateChange";
import { produce } from "immer";
export { applyImmerToStateChange };

let isApplied = false;


/**
 * Adds Immer for immutable state changes
 * https://immerjs.github.io/immer/
 */
const applyImmerToStateChange = () => {
    if (isApplied) {
        console.warn("applyImmerToStateChange has already been called.");
        return;
    }
    isApplied = true;
    
    StateChange.applyNextMiddleware((stateChange:StateChange)  => (next:Function) => (state:any) =>
        applyImmer(stateChange, next, state));
};


const applyImmer = (stateChange:StateChange, next:Function, state:any) => {
    return produce(state, (draft:any) => next(draft));
};


/**
 * Exposed for testing
 */
 applyImmerToStateChange.reset = () => {
    isApplied = false;
};
  