import { compose } from "../functional/compose";
import { Logger } from "../../src/Logger/Logger";
export { StateChange };


interface StateChangeOptions {
  /** The state property name (default "state") */
  prop: string,
  /** The name of the state change event to dispatch (default "state-changed") */
  changeEventName: string
}

interface StateChangeMetaData extends StateChangeOptions {
  el: HTMLElement
}

const metaKey = Symbol();

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
  static of(el: HTMLElement, options: StateChangeOptions) {
    return new StateChange(el, options);
  }

  /** A lifting function that calls next */
  static nextWith = (stateChange: StateChange) => (fn:Function) => stateChange.continue().next(fn);
  /** A lifting function that calls tap */
  static tapWith = (stateChange: StateChange) => (fn:Function) => stateChange.continue().tap(fn);
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

  /**
   * Creates a new StateChange object.
   * @param {HTMLElement} el the data HTML element
   * @param {StateChangeOptions} options additional options
   */
  constructor(el, options = {
      prop: "state",
      changeEventName: "state-changed"
    }) {
    const { prop, changeEventName} = options;
    this[metaKey] = {
      el,
      prop,
      changeEventName
    };
  }

  [metaKey]: StateChangeMetaData;

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
    //@ts-ignore TS7503 - setting a dynamic property
    el[prop] = composeMixinsWith(this, fn)(this.getState());
    return this.continue();
  }

  /**
   * Use to perform branching or asynchronous operations.
   * @param {Function} fn a function which will recieve the currrent StateChange object.
   * @returns {StateChange}
   */
  tap(fn: Function) {
    composeMixinsWith(this, fn)(this);
    return this.continue();
  }

  /**
   * Enables running multiple 'next' functions in a pipe.
   * @param  {...any} fns a series of functions to call next on.
   * @returns {StateChange}
   */
  pipeNext(...fns: Array<Function>) {
    return fns.reduce((v, f) => v.next(f), this);
  }

  /**
   * Enables running multiple 'tap' functions in a pipe.
   * @param  {...any} fns a series of functions to call tap on.
   * @returns {StateChange}
   */
  pipeTap(...fns: Array<Function>) {
    return fns.reduce((v, f) => v.tap(f), this);
  }

  /**
   * Dispatches the state change event on the HTML element.
   * @returns {StateChange}
   */
  dispatch() {
    const {el, changeEventName} = this.meta;
    el.dispatchEvent(new CustomEvent(changeEventName));
    return this.continue();
  }

  /**
   * A proxy to the HTML element dispatchEvent method.
   * @param {CustomEvent} event The event to dispatch
   * @returns {StateChange}
   */
  dispatchEvent(event: CustomEvent) {
    const {el} = this.meta;
    el.dispatchEvent(event);
    return this.continue();
  }

  /**
   * Returns a new StateChange object based on the current one.
   * Convenient for mapping methods.
   * @returns {StateChange}
   */
  continue() {
    const {el, prop, changeEventName} = this.meta;
    return StateChange.of(el, {prop, changeEventName});
  }

  /**
   * Returns meta data stored when creating the initial StateChange object.
   * @returns {StateChangeMetaData}
   */
  get meta(): StateChangeMetaData {
    return this[metaKey];
  }
}




const composeMixinsWith = (stateChange, fn) => {
  const mixins = stateChangeMixins.map(m => m(stateChange));
  return compose(...mixins)(fn);
};

/**
 * Adds logging.
 * @param {StateChange} stateChange
 */
const insertLogger = stateChange => next => stateOrStateChange => {
  const fnName = next.name || "anonymous";
  const {el} = stateChange.meta;
  const isTap = stateOrStateChange instanceof StateChange;
  isTap ?
    Logger.log(el, "group", `> STATECHANGE.tap: ${el.constructor.name}.${fnName}()`) :
    Logger.log(el, "groupCollapsed", `> STATECHANGE.next: ${el.constructor.name}.${fnName}()`);
  const result = next(stateOrStateChange);
  !isTap && Logger.log(el, "info", `> STATECHANGE next state:`, result);
  Logger.log(el, "groupEnd");
  return result
};

/**
 * Logs errors.
 * @param {StateChange} stateChange
 */
const errorCatcher = stateChange => next => stateOrStateChange => {
  try {
    return next(stateOrStateChange);
  } catch (error) {
    const {el} = stateChange.meta;
    Logger.log(el, "error", "PIPESTATE error!", error);
    throw (error);
  }
};

const stateChangeMixins = [errorCatcher, insertLogger];
