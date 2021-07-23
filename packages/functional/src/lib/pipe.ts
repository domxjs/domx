export { pipe, pipeAsync };


/**
 * Returns the composition of a list of functions, where each function
 * consumes the return value of the previous function.
 * @param fns {Array<Function>}
 * @returns any
 */
const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T) => fns.reduce((acc, fn) => fn(acc), value);




/**
 * A pipe that uses promises so it can wait on return values.
 * @param fns {Array<Function>}
 * @returns any
 */
//@ts-ignore
const pipeAsync = (...fns : Array<Function>) => (i) => fns.reduce((v, f) => v.then(f), Promise.resolve(i));
