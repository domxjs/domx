import { compose } from "@harbor/functional/compose";
import { pipe } from "@harbor/functional/pipe";
export { Middleware }


/**
 * A class to use to run Middleware in various ways.
 */
class Middleware {
    private stack: Array<any> = [];
    
    /**
     * Expose this method for others to add to the stack of middleware.
     * @param next {Funciton} the function to use as middleware
     */
    use(next: Function) {
        this.stack.push(next);
    }

    /**
     * The simplest form of running the composed set of middleware functions.
     * @param next {Function} The main function to run first.
     * @returns any
     */
    execute(next: Function): any {
        const result = compose(...this.stack)(next);
        return result;
    }

     /*
//  el[prop] = composeMixinsWith(this, fn)(this.getState());
const composeMixinsWith = (stateChange, fn) => {
  const mixins = stateChangeMixins.map(m => m(stateChange));
  return compose(...mixins)(fn);
};
const errorCatcher = stateChange => next => stateOrStateChange => {
  try {
    return next(stateOrStateChange);
  } catch (error) {
    const {el} = stateChange.meta;
    Logger.log(el, "error", "PIPESTATE error!", error);
    throw (error);
  }
};
)
*/


    /**
     * The same as execute but allows for arguments to be passed to the middleare stack.
     * @param next {Function}
     * @param args {Array<any>}
     * @returns any
     */
    executeWithArgs(next: Function, args:Array<any>): any {
        return (compose(...this.stack)(next) as Function)(...args);
    }

    /**
     * The same as execute but maps an argument to all functions in the stack before calling next.
     * @param argToMap {any}
     * @param next {Function}
     * @returns any
     */
    mapThenExecute(argToMap: any, next: Function): any {
        return compose(...this.stack.map(fn => fn(argToMap)))(next);
    }

    /**
     * Enables mapping an argument to all middleware functions, then the next statement, and finally function arguments.
     * @param argToMap {any}
     * @param next {Function}
     * @param args {Array<any>}
     * @returns any
     */
    mapThenExecuteWithArgs(argToMap: any, next: Function, args: Array<any>): any{
        return (<Function>compose(...this.stack.map(fn => fn(argToMap)))(next))(...args);
    }
}
