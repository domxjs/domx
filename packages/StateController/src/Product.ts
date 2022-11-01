import { StateController } from "./StateController";
import { produce } from "immer";


type NextFunction<TState> = (state:TState) => void;
type TapFunction<TState> = (product:Product<TState>) => void;

/**
 * A monad like class that promotes functional style
 * state changes with a StateController
 */
export class Product<TState> {
    /**
     * Creates a new Product object.
     */
    static of<TState>(controller: StateController, stateName:string) {
        return new Product<TState>(controller, stateName);
    }

    /** A lifting function that calls next */
    static nextWith = <TState>(product: Product<TState>) => (fn:NextFunction<TState>) => product.continue(product).next(fn);
    /** A lifting function that calls tap */
    static tapWith = <TState>(product: Product<TState>) => (fn:TapFunction<TState>) => product.continue(product).tap(fn);
    /** A chainable call to requestUpdate */
    static requestUpdate = (event:Event|string) => <TState>(product: Product<TState>) => product.requestUpdate(event);
    /** A chainable call to dispatchHostEvent */
    static dispatchHostEvent = (event:Event) => <TState>(product:Product<TState>) => product.dispatchHostEvent(event);
    /** A chainable call to next */
    static next = <TState>(fn:NextFunction<TState>) => (product: Product<TState>) => product.next(fn);
    /** A chainable call to tap */
    static tap = <TState>(fn:TapFunction<TState>) => (product: Product<TState>) => product.tap(fn);
    /** Returns the current state */
    static getState = <TState>(product: Product<TState>) => product.getState();


    /**
     * 
     * @param controller 
     * @param stateName 
     */
    constructor(controller: StateController, stateName:string) {
        this.controller = controller;
        this.stateName = stateName;
    }

    private controller:StateController;
    private stateName:string;

    /**
     * Returns a snapshot of the state property.
     * Similar to a flatten method.
     * @returns {TState}
     */
    getState():TState {
        return this.controller[this.stateName] as TState;
    }

    /**
     * The primary mapping function.
     * @param {NextFunction<TState>} fn
     * @returns {Product<TState>}
     */
    next(fn: NextFunction<TState>) {
        const state = this.controller[this.stateName] as TState;
        this.controller[this.stateName] = produce(state, (draft:TState) => fn(draft)) as TState;
        return this.continue(this);
    }

    /**
     * Use to perform branching operations.
     * @param {TapFunction<TState>} fn
     * @returns {Product<TState>}
     */
    tap(fn: TapFunction<TState>) {
        fn(this);
        return this.continue(this);
    }

    /**
     * Enables running multiple 'next' functions in a pipe.
     * @param  {Array<NextFunction<TState>>} fns a series of functions to call next on.
     * @returns {Product<TState>}
     */
    pipeNext(...fns: Array<NextFunction<TState>>):Product<TState> {
        return fns.reduce((v:Product<TState>, f:NextFunction<TState>) => v.next(f), this);
    }

    /**
     * Enables running multiple 'tap' functions in a pipe.
     * @param  {...any} fns a series of functions to call tap on.
     * @returns {Product<TState>}
     */
    pipeTap(...fns: Array<TapFunction<TState>>):Product<TState> {
        return fns.reduce((v:Product<TState>, f:TapFunction<TState>) => v.tap(f), this);
    }

    /**
     * Calls requestUpdate on the controller.
     * @param {Event|string} event
     * @returns {Product<TState>}
     */
    requestUpdate(event:Event|string) {
        this.controller.requestUpdate(event);
        return this.continue(this);
    }

    /**
     * Dispatches an event on the controllers host element.
     * @param event 
     * @returns {Product<TState>}
     */
    dispatchHostEvent(event:Event) {
        this.controller.host.dispatchEvent(event);
        return this.continue(this);
    }

    /**
     * Returns a new Product object based on the current one.
     * Convenient for mapping methods.
     * @returns {Product<TState>}
     */
    continue(product:Product<TState>) {
        return Product.of<TState>(product.controller, product.stateName);
    }
}