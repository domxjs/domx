export { pipe, pipeAsync };
/**
 * Returns the composition of a list of functions, where each function
 * consumes the return value of the previous function.
 * @param  {...Function} fns the functions to pipe.
 */
const pipe = (...fns) => i => fns.reduce((v, f) => f(v), i);

/**
 * A pipe that uses promises so it can wait on return values.
 * @param  {...Function} fns the functions to pipe.
 */
const pipeAsync = (...fns) => i => fns.reduce((v, f) => v.then(f), Promise.resolve(i));