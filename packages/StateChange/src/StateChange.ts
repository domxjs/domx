import { Middleware } from "@domx/middleware";
export { StateChange, StateChangeMetaData };


interface StateChangeOptions {
  /** The state property name (default "state") */
  prop: string,
  /** The name of the state change event to dispatch (default "state-changed") */
  changeEventName: string,
  /** Set internally to carry of the name of the tap function */
  tapName?:string
}

interface StateChangeMetaData extends StateChangeOptions {
  el: HTMLElement,
  className: string,
  nextName?: string
}

const nextMiddleware = new Middleware();
const tapMiddleware = new Middleware();

/**
 * A monad like class that promotes functional style
 * state changes on an HTML element.
 */
class StateChange {
  /**
   * Creates a new StateChange object.
   * @param el {HTMLElement} The data HTML element
   * @param options {StateChangeOptions} Additional options
   * @returns {StateChange}
   */
  static of(el: HTMLElement, options?: StateChangeOptions|string) {
    return new StateChange(el, options);
  }

  /** A lifting function that calls next */
  static nextWith = (stateChange: StateChange) => (fn:Function) => stateChange.continue(stateChange).next(fn);
  /** A lifting function that calls tap */
  static tapWith = (stateChange: StateChange) => (fn:Function) => stateChange.continue(stateChange).tap(fn);
  /** A chainable call to dispatch */
  static dispatch = (stateChange: StateChange) => stateChange.dispatch();
  /** A chainable call to dispatchEvent */
  static dispatchEvent = (event:CustomEvent) => (stateChange: StateChange) => stateChange.dispatchEvent(event);
  /** A chainable call to next */
  static next = (fn:Function) => (stateChange: StateChange) => stateChange.next(fn);
  /** A chainable call to tap */
  static tap = (fn:Function) => (stateChange: StateChange) => stateChange.tap(fn);
  /** Returns the current state */
  static getState = (stateChange: StateChange) => stateChange.getState();


  static applyNextMiddleware(fn:Function) {
    nextMiddleware.use(fn);
  }

  static applyTapMiddleware(fn:Function) {
    tapMiddleware.use(fn);
  }

  static clearMiddleware() {
    nextMiddleware.clear();
    tapMiddleware.clear();
  }

  /**
   * Creates a new StateChange object.
   * @param {HTMLElement} el the data HTML element
   * @param {StateChangeOptions} options additional options
   */
  constructor(el: HTMLElement, options:StateChangeOptions|string = {
      prop: "state",
      changeEventName: "state-changed"
    }) {
    
    if (typeof options === "string") {
      const prop = options;
      options = {
        prop,
        //@ts-ignore TS2339 looking for dataProperties on ctor
        changeEventName: el.constructor.dataProperties?.[prop]?.changeEvent || `${prop}-changed`
      };
    }
    
    const { prop, changeEventName, tapName} = options;
    const className = el.constructor.name;
    this.metaData = {
      el,
      className,
      prop,
      changeEventName,
      tapName
    };
  }

  // try using Symbol here again
  private metaData: StateChangeMetaData;

  /**
   * Returns a snapshot of the elements state property.
   * Similar to a flatten method.
   * @returns {Object}
   */
  getState() {
    const {el, prop} = this.meta;
    //@ts-ignore TS7503 - returing a dynamic property
    return el[prop];
  }

  /**
   * The primary mapping function.
   * @param {Function} fn a function that recieves state and should return updated state.
   * @returns {StateChange}
   */
  next(fn: Function) {
    const {el, prop} = this.meta;
    this.metaData.nextName = getFnName(fn);
    //@ts-ignore TS7503 - setting a dynamic property
    el[prop] = nextMiddleware.mapThenExecute(this, fn, [this.getState()]);
    return this.continue(this);
  }

  /**
   * Use to perform branching or asynchronous operations.
   * @param {Function} fn a function which will recieve the currrent StateChange object.
   * @returns {StateChange}
   */
  tap(fn: Function) {
    this.metaData.tapName = getFnName(fn);
    tapMiddleware.execute(fn, [this]);
    return this.continue(this);
  }

  /**
   * Enables running multiple 'next' functions in a pipe.
   * @param  {...any} fns a series of functions to call next on.
   * @returns {StateChange}
   */
  pipeNext(...fns: Array<Function>) {
    return fns.reduce((v:StateChange, f) => v.next(f), this);
  }

  /**
   * Enables running multiple 'tap' functions in a pipe.
   * @param  {...any} fns a series of functions to call tap on.
   * @returns {StateChange}
   */
  pipeTap(...fns: Array<Function>) {
    return fns.reduce((v:StateChange, f) => v.tap(f), this);
  }

  /**
   * Dispatches the state change event on the HTML element.
   * @returns {StateChange}
   */
  dispatch() {
    const {el, changeEventName} = this.meta;
    el.dispatchEvent(new CustomEvent(changeEventName));
    return this.continue(this);
  }

  /**
   * A proxy to the HTML element dispatchEvent method.
   * @param {CustomEvent} event The event to dispatch
   * @returns {StateChange}
   */
  dispatchEvent(event: CustomEvent) {
    const {el} = this.meta;
    el.dispatchEvent(event);
    return this.continue(this);
  }

  /**
   * Returns a new StateChange object based on the current one.
   * Convenient for mapping methods.
   * @returns {StateChange}
   */
  continue(stateChange:StateChange) {
    const {el, prop, changeEventName, tapName} = this.meta;
    return StateChange.of(el, {prop, changeEventName, tapName});
  }

  /**
   * Returns meta data stored when creating the initial StateChange object.
   * @returns {StateChangeMetaData}
   */
  get meta(): StateChangeMetaData {
    return this.metaData;
  }
}

/**
 * Returns the name to log in the dev tools inspector.
 * @param next {Function}
 * @returns {String}
 */
const getFnName = (next:Function) => {
  let fnName = next.name || "anonymous";
  if (fnName.indexOf("2") === fnName.length-1) {
      fnName = fnName.substring(0, fnName.length - 1);
  }
  return fnName;
};