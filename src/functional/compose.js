export { compose, composeAsync };

/**
 * Returns the composition of a list of functions, where each function
 * consumes the return value of the function that follows.
 * @param  {...Function} fns the functions to compose.
 */
const compose = (...fns) => i => fns.reduceRight((v, f) => f(v), i);

/**
 * A compose that uses promises so it can wait on return values.
 * @param  {...Function} fns the functions to compose.
 */
const composeAsync = (...fns) => i => fns.reduceRight((v, f) => v.then(f), Prosmise.resolve(i));
