/**
 * Redux Dev Tools Middleware
 */



/* 

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
