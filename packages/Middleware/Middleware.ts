import { compose } from "@harbor/functional/compose";
// import { pipe } from "@harbor/functional/pipe";
export { Middleware }

/*

stack = [c, b, a];
main = n;

b(a(n))


*/
/*
el[prop] = composeMixinsWith(this, fn)(this.getState());
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
 * A class to use to run Middleware in various ways.
 */
class Middleware {
    /*private*/ stack: Array<any> = [];
    
    /**
     * Expose this method for others to add to the stack of middleware.
     * @param next {Funciton} the function to use as middleware
     */
    use(next: Function) {
        this.stack.push(next);
    }

    /**
     * The same as execute but allows for arguments to be passed to the middleare stack.
     * @param next {Function}
     * @param args {Array<any>}
     * @returns any
     */
    execute(next: Function, args:Array<any>): any {
        return (compose(...this.stack)(next) as Function)(...args);
    }

    /**
     * Enables mapping an argument to all middleware functions, then the next statement, and finally function arguments.
     * @param argToMap {any}
     * @param next {Function}
     * @param args {Array<any>}
     * @returns any
     */
    mapThenExecute(argToMap: any, next: Function, args: Array<any>): any{
        return (<Function>compose(...this.stack.map(fn => fn(argToMap)))(next))(...args);
    }
}
