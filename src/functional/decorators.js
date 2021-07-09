import {debounce as debounceFn} from './debounce';
export { debounce };


/**
 * Ensures the function is only called once during the set delay.
 * @param {Number} [delay=300] the number of miliseconds to wait
 * @param {Object} [options=] debounce options
 * @param {Boolean} [options.immediate=false] executes the function at the beginning
 * instead of at the end of the delay
 */
function debounce(delay = 300, {immediate = false} = {}) {
  return (prototype, key, descriptor) => {
		descriptor.value = debounceFn(descriptor.value, delay, immediate);
		return descriptor;
  };
};