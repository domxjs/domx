
import { compose } from "../functional/compose.js";
export { Middleware }

/*

Module.use((p1, p2, next) => {
	// do something
	next();
})


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

mw.execute(this, next, state)

*/



/**
 * This should work - need to think of where to put this class
 * Researching that now...
 * 
 * Create tests:
 * Tests to consider
 *  for execute what happens if you dont call next?
 */
class Middleware {
    private stack: Array<Function> = [];
    
    use(next: Function) {
        this.stack.push(next);
    }

    execute(next: Function) {
        return compose(...this.stack)(next);
    }

    executeWithArgs<T>(next: Function, args:Array<any>) {
        return <T> compose(...this.stack)(next)(...args);
    }

    mapThenExecute<T>(argToMap: any, next: Function) {
        return <T>compose(...this.stack.map(fn => fn(argToMap)))(next);
    }

    mapThenExecuteWithArgs<T>(argToMap: any, next: Function, args: Array<any>){
        return <T>compose(...this.stack.map(fn => fn(argToMap)))(next)(...args);
    }
}


/* REDUX DEVTOOLS

https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Methods.md


Exists if there is the dev tools extension
window.__REDUX_DEVTOOLS_EXTENSION__
connect({name,...}): returns DevTools
disconnect()
send(action, state, [options, instanceId])
listen(onMessage, instanceId)
open
notifyErrors


DevTools Instance
subscribe(listener) - adds a change listener. It will be called any time an action is dispatched from the monitor. Returns a function to unsubscribe the current listener.
unsubscribe() - unsubscribes all listeners.
send(action, state) - sends a new action and state manually to be shown on the monitor. If action is null then we suppose we send liftedState.
init(state) - sends the initial state to the monitor.
error(message) - sends the error message to be shown in the extension's monitor.

*Note: instanceId seems to be an auto id generated when calling connect.
*/
