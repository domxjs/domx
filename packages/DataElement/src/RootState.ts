export { RootState };


interface StateMap {
    [key:string]: StateMap|undefined
}

interface Root {
    state:StateMap
}

declare global {
    interface Window {
        [stateProp]: StateMap;
    }
}


const stateProp = Symbol();


/**
 * Used to keep track of a global state tree
 * for data elements.
 */
class RootState {
    /** Initializes/resets the root state */
    static init(state:StateMap) {
        RootState.current = state;
    }

    /** Returns the state at the given state path */
    static get(path:string):object|null {
        const value = path.split(".").reduce((state:StateMap|undefined, prop:string) =>
            state !== undefined ? state[prop] : undefined, RootState.current);
        return value === undefined ? null : value;
    }

    /** Sets the state at the given state path */
    static set(path:string, value: object):void {    
        setState(RootState.current, path, value);
    }

    /** Removes the state at the given state path */
    static delete(path:string):void {
        setState(RootState.current, path, undefined);
    }

    /**
     * Creates a copy of the root state and sets the value at the state path.
     * Used for intermediate changes before committing.
     */
    static draft(path:string, value: object):StateMap {
        const copy = JSON.parse(JSON.stringify(RootState.current));
        const state = setState(copy, path, value);
        return state;
    }

    /** The current root state */
    static get current() {
        if (!window[stateProp]) {
            window[stateProp] = {};
        }
        return window[stateProp];
    }

    private static set current(state:StateMap) {
        window[stateProp] = state;
    }

    static snapshot(name:string) {
        window.dispatchEvent(new CustomEvent("rootstate-snapshot", {
            detail: {
                name,
                state: RootState.current
            }
        }));
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
                // if empty, then delete that part as well
                if (Object.keys(currentState).length === 0) {
                    setState(RootState.current,
                        pathParts.splice(0, pathParts.length - 1).join("."), undefined);
                }
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