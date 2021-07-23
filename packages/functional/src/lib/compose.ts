export { compose, composeAsync };


/**
 * Returns the composition of a list of functions, where each function
 * consumes the return value of the function that follows.
 * @param fns {Array<Function>}
 * @returns Function
 */
 const compose = <T>(...fns: Array<(arg: T) => any>) => (value: T) => fns.reduceRight((acc, fn) => fn(acc), value);



 /**
  * A compose that uses promises so it can wait on return values.
  * @param fns {Array<Function>}
  * @returns Function
  */
 //@ts-ignore
 const composeAsync = (...fns : Array<Function>) => (i) => fns.reduceRight((v, f) => v.then(f), Promise.resolve(i));