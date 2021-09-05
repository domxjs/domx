export { RootState };
let rootState = {};
class RootState {
    static get(path) {
        const value = path.split(".").reduce((state, prop) => state !== undefined ? state[prop] : undefined, rootState);
        return value === undefined ? null : value;
    }
    static set(path, value) {
        let currentState = rootState;
        const pathParts = path.split(".");
        pathParts.forEach((prop, index) => {
            if (index === pathParts.length - 1) {
                if (value === undefined) {
                    console.log("DELETING", prop, currentState[prop]);
                    delete currentState[prop];
                    console.log("DELETED", prop, currentState);
                }
                else {
                    currentState[prop] = value;
                }
            }
            else if (currentState[prop] === undefined) {
                currentState[prop] = {};
                currentState = currentState[prop];
            }
        });
        console.log("SET", rootState);
    }
    static delete(path) {
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
//# sourceMappingURL=RootState.js.map