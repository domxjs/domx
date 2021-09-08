export { RootState };


interface StateMap {
    [key:string]: StateMap|undefined
}

let rootState:StateMap = {};

/**
 * Used to keep track of a global state tree
 * for data elements.
 */
class RootState {
    /** Initializes/resets the root state */
    static init(state:StateMap) {
        rootState = state;
    }

    /** Returns the state at the given state path */
    static get(path:string):object|null {
        const value = path.split(".").reduce((state:StateMap|undefined, prop:string) =>
            state !== undefined ? state[prop] : undefined, rootState);
        return value === undefined ? null : value;
    }

    /** Sets the state at the given state path */
    static set(path:string, value: object):void {      
        setState(rootState, path, value);
    }

    /** Removes the state at the given state path */
    static delete(path:string):void {
        setState(rootState, path, undefined);
    }

    /**
     * Creates a copy of the root state and sets the value at the state path.
     * Used for intermediate changes before committing.
     */
    static draft(path:string, value: object):StateMap {
        const copy = JSON.parse(JSON.stringify(rootState));
        return setState(copy, path, value);
    }

    /** The current root state */
    static get current() {
        return rootState;
    }
}

/** Used for setting, deleting, and drafting state */
const setState = (state:StateMap, path:string, value:object|undefined):StateMap => {
    let currentState = state;
    const pathParts = path.split(".");
    pathParts.forEach((prop:string, index:number) => {
        if (index === pathParts.length - 1) {
            if (value === undefined) {
                delete currentState[prop];
            } else {
                currentState[prop] = { ...value } as StateMap;
            }
        } else if (currentState[prop] === undefined) {
            currentState[prop] = {};
        }
        currentState = currentState[prop] as StateMap;
    });
    return state;
};