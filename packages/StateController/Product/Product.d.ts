import { StateController } from "../StateController";
import { produce } from "immer";
export { produce };
declare type NextFunction<TState> = (state: TState) => void;
declare type TapFunction<TState> = (product: Product<TState>) => void;
/**
 * A monad like class that promotes functional style
 * state changes with a StateController
 */
export declare class Product<TState> {
    /**
     * Creates a new Product object.
     */
    static of<TState>(controller: StateController, stateName: string): Product<TState>;
    /** A lifting function that calls next */
    static nextWith: <TState_1>(product: Product<TState_1>) => (fn: NextFunction<TState_1>) => Product<TState_1>;
    /** A lifting function that calls tap */
    static tapWith: <TState_1>(product: Product<TState_1>) => (fn: TapFunction<TState_1>) => Product<TState_1>;
    /** A chainable call to requestUpdate */
    static requestUpdate: (event: Event | string) => <TState_1>(product: Product<TState_1>) => Product<TState_1>;
    /** A chainable call to dispatchHostEvent */
    static dispatchHostEvent: (event: Event) => <TState_1>(product: Product<TState_1>) => Product<TState_1>;
    /** A chainable call to next */
    static next: <TState_1>(fn: NextFunction<TState_1>) => (product: Product<TState_1>) => Product<TState_1>;
    /** A chainable call to tap */
    static tap: <TState_1>(fn: TapFunction<TState_1>) => (product: Product<TState_1>) => Product<TState_1>;
    /** Returns the current state */
    static getState: <TState_1>(product: Product<TState_1>) => TState_1;
    /**
     *
     * @param controller
     * @param stateName
     */
    constructor(controller: StateController, stateName: string);
    private controller;
    private stateName;
    /**
     * Returns a snapshot of the state property.
     * Similar to a flatten method.
     * @returns {TState}
     */
    getState(): TState;
    /**
     * The primary mapping function.
     * @param {NextFunction<TState>} fn
     * @returns {Product<TState>}
     */
    next(fn: NextFunction<TState>): Product<TState>;
    /**
     * Use to perform branching operations.
     * @param {TapFunction<TState>} fn
     * @returns {Product<TState>}
     */
    tap(fn: TapFunction<TState>): Product<TState>;
    /**
     * Enables running multiple 'next' functions in a pipe.
     * @param  {Array<NextFunction<TState>>} fns a series of functions to call next on.
     * @returns {Product<TState>}
     */
    pipeNext(...fns: Array<NextFunction<TState>>): Product<TState>;
    /**
     * Enables running multiple 'tap' functions in a pipe.
     * @param  {...any} fns a series of functions to call tap on.
     * @returns {Product<TState>}
     */
    pipeTap(...fns: Array<TapFunction<TState>>): Product<TState>;
    /**
     * Calls requestUpdate on the controller.
     * @param {Event|string} event
     * @returns {Product<TState>}
     */
    requestUpdate(event: Event | string): Product<TState>;
    /**
     * Dispatches an event on the controllers host element.
     * @param event
     * @returns {Product<TState>}
     */
    dispatchHostEvent(event: Event): Product<TState>;
    /**
     * Returns a new Product object based on the current one.
     * Convenient for mapping methods.
     * @returns {Product<TState>}
     */
    continue(product: Product<TState>): Product<TState>;
}
//# sourceMappingURL=Product.d.ts.map