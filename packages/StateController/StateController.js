export class RootStateChangeEvent extends Event {
    constructor(event, rootState, controller, statePath, state) {
        super(RootStateChangeEvent.eventType);
        this.event = event;
        this.rootState = Object.assign({}, rootState);
        this.controller = controller;
        this.statePath = statePath;
        this.state = Object.assign({}, state);
    }
}
RootStateChangeEvent.eventType = "rootstate-change";
;
class StatePathChangeEvent extends Event {
    constructor(controller, statePath, state) {
        super(statePath);
        this.controller = controller;
        this.statePath = statePath;
        this.state = state;
    }
}
const rootState = {};
export class RootState {
    static addStateChangeEventListener(statePath, listener, signal) {
        this.bus.addEventListener(statePath, listener, { signal });
        const count = this.listenerCounts[statePath];
        this.listenerCounts[statePath] = count === undefined ? 1 : count + 1;
        // delete state path when aborted
        signal.addEventListener("abort", () => {
            const count = this.listenerCounts[statePath] - 1;
            this.listenerCounts[statePath] = count;
            if (count === 0) {
                delete rootState[statePath];
            }
        });
    }
    static addRootStateChangeEventListener(listener, signal) {
        this.bus.addEventListener(RootStateChangeEvent.eventType, listener, { signal });
        signal && signal.addEventListener("abort", () => {
            const test = "this should be called";
        });
    }
    static get(name) {
        const value = rootState[name];
        return value === undefined ? null : value;
    }
    static change(controller, event, statePath, state) {
        rootState[statePath] = state;
        this.bus.dispatchEvent(new StatePathChangeEvent(controller, statePath, state));
        this.bus.dispatchEvent(new RootStateChangeEvent(event, rootState, controller, statePath, state));
        return true;
    }
    static get current() { return rootState; }
    ;
}
RootState.bus = new EventTarget();
RootState.listenerCounts = {};
const stateControllerIndexedProxyHandler = {
    get: (target, property) => target[property],
    set: (target, property, value) => target[property] = value
};
export class StateController {
    constructor(host) {
        this.stateProperties = [];
        this.abortController = new AbortController();
        (this.host = host).addController(this);
        return new Proxy(this, stateControllerIndexedProxyHandler);
    }
    get stateId() {
        return this.host.stateId !== undefined ?
            this.host.stateId : null;
    }
    ;
    trackState(name) {
        this.stateProperties.push(name);
    }
    hostConnected() {
        this.stateProperties.forEach(name => this.initState(name));
    }
    requestUpdate(event) {
        this.stateProperties.forEach(name => RootState.change(this, event, this.getStateName(name), this[name]));
        this.host.requestUpdate();
    }
    hostDisconnected() {
        this.abortController.abort();
        this.abortController = new AbortController();
    }
    initState(name) {
        this.syncStateValue(name);
        this.addStateListeners(name);
    }
    syncStateValue(name) {
        const statePath = this.getStateName(name);
        const initialState = RootState.get(statePath);
        if (initialState === null) {
            RootState.change(this, `${this.constructor.name}.trackState(${name})`, statePath, this[name]);
        }
        else {
            this[name] = initialState;
        }
    }
    addStateListeners(name) {
        const statePath = this.getStateName(name);
        RootState.addStateChangeEventListener(statePath, (event) => {
            if (event.controller !== this) {
                this[name] = event.state;
                this.host.requestUpdate();
            }
        }, this.abortController.signal);
    }
    getStateName(name) {
        const stateIdPath = this.stateId ? `.${this.stateId}` : "";
        return `${this.constructor.name}${stateIdPath}.${name}`;
    }
}
//# sourceMappingURL=StateController.js.map