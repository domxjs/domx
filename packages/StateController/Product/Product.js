import { produce } from "immer";
export { produce };
/**
 * A monad like class that promotes functional style
 * state changes with a StateController
 */
export class Product {
    /**
     *
     * @param controller
     * @param stateName
     */
    constructor(controller, stateName) {
        this.controller = controller;
        this.stateName = stateName;
    }
    /**
     * Creates a new Product object.
     */
    static of(controller, stateName) {
        return new Product(controller, stateName);
    }
    /**
     * Returns a snapshot of the state property.
     * Similar to a flatten method.
     * @returns {TState}
     */
    getState() {
        return this.controller[this.stateName];
    }
    /**
     * The primary mapping function.
     * @param {NextFunction<TState>} fn
     * @returns {Product<TState>}
     */
    next(fn) {
        const state = this.controller[this.stateName];
        this.controller[this.stateName] = produce(state, (draft) => fn(draft));
        return this.continue(this);
    }
    /**
     * Use to perform branching operations.
     * @param {TapFunction<TState>} fn
     * @returns {Product<TState>}
     */
    tap(fn) {
        fn(this);
        return this.continue(this);
    }
    /**
     * Enables running multiple 'next' functions in a pipe.
     * @param  {Array<NextFunction<TState>>} fns a series of functions to call next on.
     * @returns {Product<TState>}
     */
    pipeNext(...fns) {
        return fns.reduce((v, f) => v.next(f), this);
    }
    /**
     * Enables running multiple 'tap' functions in a pipe.
     * @param  {...any} fns a series of functions to call tap on.
     * @returns {Product<TState>}
     */
    pipeTap(...fns) {
        return fns.reduce((v, f) => v.tap(f), this);
    }
    /**
     * Calls requestUpdate on the controller.
     * @param {Event|string} event
     * @returns {Product<TState>}
     */
    requestUpdate(event) {
        this.controller.requestUpdate(event);
        return this.continue(this);
    }
    /**
     * Dispatches an event on the controllers host element.
     * @param event
     * @returns {Product<TState>}
     */
    dispatchHostEvent(event) {
        this.controller.host.dispatchEvent(event);
        return this.continue(this);
    }
    /**
     * Returns a new Product object based on the current one.
     * Convenient for mapping methods.
     * @returns {Product<TState>}
     */
    continue(product) {
        return Product.of(product.controller, product.stateName);
    }
}
/** A lifting function that calls next */
Product.nextWith = (product) => (fn) => product.continue(product).next(fn);
/** A lifting function that calls tap */
Product.tapWith = (product) => (fn) => product.continue(product).tap(fn);
/** A chainable call to requestUpdate */
Product.requestUpdate = (event) => (product) => product.requestUpdate(event);
/** A chainable call to dispatchHostEvent */
Product.dispatchHostEvent = (event) => (product) => product.dispatchHostEvent(event);
/** A chainable call to next */
Product.next = (fn) => (product) => product.next(fn);
/** A chainable call to tap */
Product.tap = (fn) => (product) => product.tap(fn);
/** Returns the current state */
Product.getState = (product) => product.getState();
//# sourceMappingURL=Product.js.map