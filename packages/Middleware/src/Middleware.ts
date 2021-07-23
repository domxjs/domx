import { compose } from "@harbor/functional/lib/compose";
export { Middleware }


/**
 * A class used to execute middleware.
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
     * Executes middleware functions given the passed arguments.
     * @param next {Function} The main function to execute.
     * @param args {Array<any>} Arguments to pass to the next function.
     * @returns any The value returned from the next function.
     */
    execute(next: Function, args:Array<any>): any {
        return (compose(...this.stack)(next) as Function)(...args);
    }

    /**
     * Enables mapping an argument to all middleware functions before executing.
     * @param argToMap {any} The arugment mapped to the middleware functions.
     * @param next {Function} The main function to execute.
     * @param args {Array<any>} Arguments to pass to the next function.
     * @returns any The value returned from the next function.
     */
    mapThenExecute(argToMap: any, next: Function, args: Array<any>): any{
        return (<Function>compose(...this.stack.map(fn => fn(argToMap)))(next))(...args);
    }
}
