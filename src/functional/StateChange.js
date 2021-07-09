import { compose } from "./compose";
import { Logger } from "../Logger/Logger";
export { StateChange };

/**
 * @typedef StateChangeOptions
 * @property {String="state"} prop the state property name
 * @property {String="state-changed"} changeEventName the name
 * of the state change event to dispatch
 */

/**
 * @typedef StateChangeMetaData
 * @property {HTMLElement} el
 * @property {String} prop
 * @property {String} changeEventName
 */

/**
 * A monad like class that promotes functional style
 * state changes on an HTML element.
 */
class StateChange {
  /**
   * Creates a new StateChange object.
   * @param {HTMLElement} el the data HTML element
   * @param {StateChangeOptions} options additional options
   * @returns {StateChange}
   */
  static of(el, options) {
    return new StateChange(el, options);
  }

  /** A lifting function that calls next */
  static nextWith = stateChange => fn => stateChange.continue().next(fn);
  /** A lifting function that calls tap */
  static tapWith = stateChange => fn => stateChange.continue().tap(fn);
  /** A chainable call to dispatch */
  static dispatch = stateChange => stateChange.dispatch();
  /** A chainable call to dispatchEvent */
  static dispatchEvent = event => stateChange => stateChange.dispatchEvent(event);
  /** A chainable call to next */
  static next = fn => stateChange => stateChange.next(fn);
  /** A chainable call to tap */
  static tap = fn => stateChange => stateChange.tap(fn);
  /** Returns the current state */
  static getState = stateChange => stateChange.getState();

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

  /**
   * Returns a snapshot of the elements state property.
   * Similar to a flatten method.
   * @returns {Object}
   */
  getState() {
    const {el, prop} = this.meta;
    return el[prop];
  }

  /**
   * The primary mapping function.
   * @param {Function} fn a function that recieves state and should return updated state.
   * @returns {StateChange}
   */
  next(fn) {
    const {el, prop} = this.meta;
    el[prop] = composeMixinsWith(this, fn)(this.getState());
    return this.continue();
  }

  /**
   * Use to perform branching or asynchronous operations.
   * @param {Function} fn a function which will recieve the currrent StateChange object.
   * @returns {StateChange}
   */
  tap(fn) {
    composeMixinsWith(this, fn)(this);
    return this.continue();
  }

  /**
   * Enables running multiple 'next' functions in a pipe.
   * @param  {...any} fns a series of functions to call next on.
   * @returns {StateChange}
   */
  pipeNext(...fns) {
    return fns.reduce((v, f) => v.next(f), this);
  }

  /**
   * Enables running multiple 'tap' functions in a pipe.
   * @param  {...any} fns a series of functions to call tap on.
   * @returns {StateChange}
   */
  pipeTap(...fns) {
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
   * @param {Event} event the event to dispatch
   * @returns {StateChange}
   */
  dispatchEvent(event) {
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
  get meta() {
    return this[metaKey];
  }
}


const metaKey = Symbol();

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
