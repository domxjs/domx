# StateChange &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.mit.edu/~amini/LICENSE.md) [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/StateChange)](https://travis-ci.com/github/domxjs/domx) [![Lines](https://img.shields.io/badge/Coverage-99.48%25-brightgreen.svg?style=flat)](https://app.travis-ci.com/github/domxjs/domx/branches) [![npm](https://img.shields.io/npm/v/@domx/statechange)](https://www.npmjs.com/package/@domx/statechange)



`StateChange` is a monad-like object that enables changing a property on an HTMLElement in a `functional` way.

[Installation](#installation) \
[Basic usage](#basic-usage) \
[Configuration](#configuration) \
[Middleware (logging, error handling, immutable state handling)](#middleware) \
[Full example](#full-example) \
[Advanced usage](#advanced-usage)


## Installation
```sh
npm install @domx/statechange
```

## Basic usage
The basic examples will be using this default state...
```js
const defaultState = {
    isLoading: false,
    userType: null,
    users: []
};
```
> and this HTMLElement...

```js
class UserListElement extends HTMLElement {
    state = defaultState
}
window.customElements.define("user-list", UserListElement);
```


### Changing state

#### Creating a `StateChange` object
A StateChange object is created by passing it the HTMLElement containing the `state` property you want to manage. 

```js
StateChange.of(el)
// or
new StateChange(el)
```


#### State functions
A state function is a function that takes a state object and returns a new state object.

```js
const setIsLoading = state => ({
    ...state,
    isLoading: true
});
```

#### Setting the next state
Changing the state can be done by calling  `next` on the `StateChange` instance.
```js
class UserListElement extends HTMLElement {
    //...
    setIsLoading() {
        StateChange.of(this)
            .next(setIsLoading); // sets the next state
    }
}
```

#### Notifying the change
Then dispatch a `state-change` event by calling `dispatch` on the `StateChange` instance.
```js
class UserListElement extends HTMLElement {
    //...
    setIsLoading() {
        StateChange.of(this)
            .next(setIsLoading);
            .dispatch(); // dispatches the 'state-change' event
    }
}
```



### Async or branching functions

#### Using `tap`
When needing to do more than just setting the next state object, a `tap` function can be used to perform any logic, branching, or asynchronous operations.

```js
import { EventMap } from "@domx/eventmap";
import { event } from "@domx/eventmap/decorators";

class UserListElement extends EventMap(HTMLElement){
    //...
    @event("request-users")
    requestUsers() {
        StateChange.of(this)
            .tap(requestUsers);
    }
}
```
> When using tap, the argument passed is the `StateChange` instance.
```js
const requestUsers = async stateChange => {
  const response = await sendRequest({
    url: "/api/users"
  });

  // now that we have the users, use the stateChange `next`
  // function to set those users
  stateChange
    .next(receiveUsers(response.users))
    .dispatch();
};
```

#### Passing an argument to a state function
The `receiveUsers` function takes the list of users then needs to return a function that can be passed to the `next` method.
```js
const receiveUsers = users =>
    function recieveUsers(state) {
        return {
            ...state,
            users
        };
    }
```
> The reason for writing the method with an inner `function` is so that logging can pick up on the function name. The method could be written like this:
```js
const receiveUsers = users => state => ({
    ...state,
    users
});
```
> But logging would log an `anonymous` method.


### Dispatching events
In addition to using the `dispatch` method which dispatches the `state-change` event, any event can be dispatched using the `dispatchEvent` method.
```js
const requestUsers = stateChange => {
  ///...
  stateChange
    .next(receiveUsers(response.users))
    .dispatch()
    .dispatchEvent(new CustomEvent("show-system-toast", {
        detail: {text: "Users loaded."}
    }));
};
```


## Configuration
The `StateChange` constructor takes an optional configuration object that allows you to control the name of the `state` property and the name of the `state-change` event.
```js
// The default configuration:
StateChange.of(this, {
    property: "state",
    changeEvent: "state-changed"
});

// Changing the property and change event name
StateChange.of(this, {
    property: "currentUser",
    changeEvent: "current-user-changed"
});
```
> A string can also be used to set the property and change event.
```js
StateChange.of(this, "user");
// sets the property to "user"
// and sets the changeEvent to "user-changed"
```
> For use with DataElements, the change event name will first be looked for on 
a static `dataProperties` property.
```js
export class TestStateProp3 extends HTMLElement {
  static dataProperties = {
    user: {
      changeEvent: "user-change-event"
    }
  }

  user = {
    userName: "joeuser"
  };

  changeName(userName: string) {
    // dispatch here will trigger the "user-change-event"
    // as described in the static dataProperties property
    StateChange.of(this, "user")
      .dispatch();
  }
}
```


## Middleware
`StateChange` exposes middleware to hook into both the `next` and
the `tap` functions.

There are also four functions available to apply logging, error handling, and immutable state changes via Immer.

### Redux Dev Tool Logging
Logs next and tap calls to the Redux dev tools extension.
```js
import {applyStateChangeRdtLogging} from "@domx/StateChange/applyStateChangeRdtLogging";
applyStateChangeRdtLogging();
```

### Immer - to simplify handling immutable data structures
See https://immerjs.github.io/immer/produce
```js
import {applyImmerToStateChange} from "@domx/StateChange/applyImmerToStateChange";
applyImmerToStateChange();
```

### Logging
Logs next and tap calls with state snapshots.
```js
import {applyStateChangeConsoleLogging} from "@domx/StateChange/applyStateChangeConsoleLogging";
applyStateChangeConsoleLogging();

// or call with collapsed:true to collapse console logging groups
applyStateChangeConsoleLogging({collapsed:true});
```
### Error handling
Logs and throws the error.
```js
import {applyStateChangeErrorHandling} from "@domx/StateChange/applyStateChangeErrorHandling";
applyStateChangeErrorHandling();
```

### Adding custom middleware
```js
import {StateChange} from "@domx/StateChange";

StateChange.applyNextMiddleware(stateChange => next => state =>{
    // add custom behaviors and return next
    return next(state);
});

StateChange.applyTapMiddleware(next => stateChange => {
    // add custom behaviors and call next
    next(stateChange);
});

// removes all middelware methods
StateChange.clearMiddleware();
```




## Full example
This is a full example using the _basic_ methods for changing state.
```js
import { StateChange } from '@domx/statechange';
import { EventMap, event } from '@domx/eventmap';
import { showSystemToastEvent } from '../../system-toast/events';
export { UserListElement };


const defaultState = {
    isLoading: false,
    userType: null,
    users: []
};

class FetchUsersEvent extends Event {
    static eventType = "fetch-users";
    userType:string;
    constructor(userType:string) {
        super(FetchUsersEvent.eventType);
        this.userType = userType;
    }
}

class UserListElement extends EventMap(HTMLElement) {

    // set the default state
    state = defaultState;

    // a UI event that indicates users of a specific
    // userType should be fetched
    @event(FetchUsersEvent.eventType)
    fetchUsers(event: FetchUsersEvent) {
        // use StateChange to set the userType
        // and request the users
        StateChange.of(this)
            .next(setUserType(event.userType))
            .tap(requestUsers)
            .dispatch();
    }
}


// example of function receiving input (userType)
// and returning a state function
const setUserType = userType =>
    function setUserType(state) {
        return {
            ...state,
            userType
        };
    };


// behavioral function used to make an HTTP request then
// update the state when the users are received
const requestUsers = stateChange => {    
    const {userType} = stateChange.getState();
    
    stateChange
        .next(setIsLoading)
        .dispatch();

    const response = await sendRequest({
        url: "/api/users",
        params: { userType }
    });

    // now that we have the users, use stateChange
    // to set the next state and dispatch the events
    stateChange
        .next(receiveUsers(response.users))
        .dispatch()
        .dispatchEvent(showSystemToastEvent({text: "Users loaded."}));
};


// simple state function
const setIsLoading = state => ({
    ...state,
    isLoading: true
});


// another function receiving input and
// returning a state function
const receiveUsers = users =>
    function receiveUsers(state) {
        return {
            ...state,
            isLoading: false,
            users
        };
    };
```



## Advanced usage
The `StateChange` object enables many ways of composing functionality and functional programming encourages breaking down functions into their smallest operations. 

### Breaking down functions
If a function is large or has if/else statements it is likely a candidate for being broken down.

Breaking down functions has the added benifits of being re-usable, easy to test (or no test needed at all), and tends to be more readable.

### Conditionals
Given this simple conditional
```js
const setNextSkip = state => {
    if (state.totalCount < state.take + state.skip) {
        return {
            ...state
            skip: state.skip + 50;
        }
    }
    return state;
}
```
> It can be broken down into 3 separate functions.
```js
const hasMoreItems = state =>
    state.totalCount < state.take + state.skip;

const skipMoreItems = state => ({
    ...state,
    skip: state.skip + 50;
});

const setNextSkip = state =>
    hasMoreItems(state) ? skipMoreItems(state) : state;
```


### Using pipes
Using a pipe or a compose method can help when needing to incorporate functions outside of `StateChange`.

The following method is not too bad but is a candidate for pipes. 
```js
const setFilterFromUrl = stateChange => {
    const { searchParams } = new URL(window.location.href);
    const filter = searchParams.get("filter");
    stateChange
        .next(setAccountFilter(filter));
        .dispatch();
};

```
> First by turning the first two lines into functions
```js
const getSearchParams => new URL(window.location.href).searchParams;
const getFilterParam = searchParams => searchParams.get("filter");
```
> In order to use `StateChange` with a pipe there needs to be a way to insert the `stateChange` parameter into the pipe. This can be done with `StateChange.nextWith(stateChange)`.
```js
const setFilterFromUrl = stateChange => pipe(
    getSearchParams,
    getFilterParam,
    setAccountFilter(filter),
    StateChange.nextWith(stateChange)
    StateChange.dispatch
)();
```
There are a series of static `StateChange` methods that enable function composition.
* `StateChange.nextWith(stateChange)(fn)` - A lifting function that calls next
* `StateChange.tapWith(stateChange)(fn)` -  A lifting function that calls tap
* `StateChange.dispatch(stateChange)` - A chainable call to dispatch
* `StateChange.dispatchEvent(stateChange)` - A chainable call to dispatchEvent
* `StateChange.next(fn)(stateChange)` - A chainable call to next
* `StateChange.tap(fn)(stateChange)` - A chainable call to tap
* `StateChange.getState(stateChange)` - Returns the current state

### Async pipe example
The `requestUsers` method from the example above could be written using an async pipe.

Here is the method for reference:
```js
const requestUsers = stateChange => {    
    const {userType} = stateChange.getState();    
    stateChange
        .next(setIsLoading)
        .dispatch();
    const response = await sendRequest({
        url: "/api/users",
        params: { userType }
    });
    stateChange
        .next(receiveUsers(response.users))
        .dispatch()
        .dispatchEvent(showSystemToastEvent({text: "Users loaded."}));
};
```
> First we can extract two more methods. One to get the `userType`
```js
const getUserType = state => state.userType;
```
> And another to do the call to `sendRequest`
```js
const sendUsersRequest = async userType => await sendRequest({
    url: "/api/users",
    params: { userType }
});
```
Now the `requestUsers` method could be written using `pipeAsync`
```js
const requestUsers = stateChange => pipeAsync(
    StateChange.next(setIsLoading), // 2
    StateChange.dispatch, // 3
    StateChange.getState, // 4
    getUserType, // 5
    sendUsersRequest, // 6
    recieveUsers, // 7
    StateChange.nextWith(stateChange), // 8
    StateChange.dispatch // 9
    StateChange.dispatchEvent(AiSystemFeedback.systemToastEvent({text: "Users loaded."})) // 10
)(stateChange); // 1

// 1 - Pass the stateChange instance to the argument of the first function in the pipe
// 2 - Get the next state from `setIsLoading`
// 3 - Call dispatch
// 4 - The `getUserType` method requires the `state` object
// 5 - Pass the user type to `sendUsersRequest`
// 6 - This is the async/promise that will return the `response` to the `recieveUsers` method
// 7 - This returns a state function (recieves and returns state)
// 8 - Taps back into the `stateChange` to call next with the function recieved in #7
// 9 - Dispatch the change event
// 10 - Dispatch some other event
```

### Functions, Functors, and Monads (oh my)
#### Useful Monad-like Types
Since `StateChange` is composable it opens the door for additional functional patterns. Here are a few other popular Monad like types that may be useful.
* `Array` - used for lists
* `Promise` - used to encapsulate possible async operations 
* `Either` (Left/Right) - control flow most commonly used with error handling
* `Result` (Ok/Error) - another implementation of `Either`.
* `Maybe` (Something/Nothing) - helps with null calls.

Optional chaining and mullish coalescing can also help: \
https://github.com/tc39/proposal-optional-chaining \
https://github.com/tc39/proposal-nullish-coalescing


#### Other references
* [Javscript Monads Made Simple](https://medium.com/javascript-scene/javascript-monads-made-simple-7856be57bfe8)
* [Two Years of Functional Programming in JavaScript: Lessons Learned](https://hackernoon.com/two-years-of-functional-programming-in-javascript-lessons-learned-1851667c726)
* [Composing Software: The Book](https://medium.com/javascript-scene/composing-software-the-book-f31c77fc3ddc) 
* [Basic Monads in JavaScript](https://dev.to/rametta/basic-monads-in-javascript-3el3)


