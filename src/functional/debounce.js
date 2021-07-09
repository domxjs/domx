
export { debounce };

/**
 * Returns a function that is only called once during the set delay.
 * @param {Function} func the function to debounce
 * @param {Number} [delay=200] the number of miliseconds to wait
 * @param {Boolean} [immediate=false] executes the function at the beginning 
 * instead of at the end of the delay
 */
const debounce = (func, delay = 300, immediate = false) => {
  let timeout;

	return function (...args) {
    const context = this;

    const later = function() {
			timeout = null;
			if (!immediate) {
				func.apply(context, args);
			}
    };
    
    const callNow = immediate && !timeout;
    
		clearTimeout(timeout);    
    timeout = setTimeout(later, delay);
    
    if (callNow) { 
			func.apply(context, args);
		}
	};
};
