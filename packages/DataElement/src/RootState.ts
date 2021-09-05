export { RootState };


interface StateMap {
    [key:string]: StateMap|undefined
}

let rootState:StateMap = {};

class RootState {
    static get(path:string):object|null {
        const value = path.split(".").reduce((state:StateMap|undefined, prop:string) =>
            state !== undefined ? state[prop] : undefined, rootState);
        return value === undefined ? null : value;
    }

    static set(path:string, value: object|undefined):void {
        let currentState = rootState;        
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
    }

    static delete(path:string):void {
        RootState.set(path, undefined);
        console.log("DELETE", rootState);
    }

    static get current() {
        return rootState;
    }

    static clear() {
        rootState = {};
    }
}