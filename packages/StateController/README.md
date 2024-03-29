# StateController &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.mit.edu/~amini/LICENSE.md) [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/StateController)](https://travis-ci.com/github/domxjs/domx) [![Lines](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg?style=flat)](https://app.travis-ci.com/github/domxjs/domx/branches) [![npm](https://img.shields.io/npm/v/@domx/statecontroller)](https://www.npmjs.com/package/@domx/statecontroller)


The `StateController` is a [Reactive Controller](https://lit.dev/docs/composition/controllers/)
that provides state to a `LitElement`.


[Highlights](#highlights) \
[Installation](#installation) \
[Basic Usage](#basic-usage) \
[Defining State Properties](#defining-state-properties) \
[Handling Events](#handling-events) \
[StateController "instances"](#statecontroller-instances) \
[Requesting Updates](#requesting-updates) \
[Using Product (Immer)](#using-product-immer) \
[Root State and State Syncing](#root-state-and-state-syncing) \
[Redux DevTools](#redux-devtools) \
[StateController Composition](#stateController-composition)


### Highlights
* Its simple to use.
* It helps keep state changes and business logic out of the UI layer.
* Supports the unidirectional data flow state management pattern.
* Tracks a global state tree to sync state changes across controllers and elements. 
* Works with [Immer](https://github.com/immerjs/immer) which
  eliminates object creation fatigue when working with immutable state.
* Contains a Product monad like class for functional state changes (similar to Redux reducers).
* It uses platform features to keep the footprint small (really, tiny).
* Can integrate with the [Redux DevTools](https://github.com/reduxjs/redux-devtools)


## Installation
```sh
npm install @domx/statecontroller
```


## Basic Usage
This is a contrived example to show a simple usage scenario.

```js
import { StateController } from "@domx/statecontroller";
import { stateProperty, hostEvent } from "@domx/statecontroller/decorators";

export class SessionStateController extends StateController {

    @stateProperty()
    state:ISessionState = {
        loggedInUserName: "",
        loggedInUsersFullName: ""
    };

    @hostEvent(UserLoggedInEvent)
    userLoggedIn(event:UserLoggedInEvent) {
        this.state = {
            ...this.state,
            loggedInUserName: event.userName,
            loggedInUsersFullName: event.fullName
        };
        this.requestUpdate(event);
    }
}

export class UserLoggedInEvent extends Event {
    static eventType = "user-logged-in";
    userName:string;
    fullName:string;
    constructor(userName:string, fullName:string) {
        super(UserLoggedInEvent.eventType);
        this.userName = userName;
        this.fullName = fullName;
    }
}

interface ISessionState {
    loggedInUserName: string;
    loggedInUsersFullName: string;
}
```
> By subclassing the Event class, The `UserLoggedInEvent` acts 
as a great way to document what events a StateController can handle.
This is similar to action creators in Redux. They can be defined
in the same file as the StateController (or in a separate file
if that works better for you) and used by UI components
to trigger events.


### UI Component
The `SessionStateController` can be used with any LitElement.

```js
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { SessionStateController, UserLoggedInEvent } from "./SessionStateController";

@customElement("current-user")
class CurrentUser extends LitElement {
    session = new SessionStateController(this);

    render() {
        const state = this.session.state;
        return html`
            <button @click=${this.updateUserClicked}>Update user</button>
            <div>
                Logged in as: ${state.loggedInUserName}
                (${state.loggedInUsersFullName})
            </div>
        `;
    }
    
    updateUserClicked(event) {
        this.dispatchEvent(new UserLoggedInEvent("juser", "Joe User"));
    }
}
```


## Defining State Properties
To set a property as a state property, simply use the `@stateProperty()` decorator
as in the example above.

This can also be done by defining a static field on the controller.
```js
export class SessionStateController extends StateController {
    static stateProperties = ["state"];

    state:ISessionState = {
        loggedInUserName: "",
        loggedInUsersFullName: ""
    };

    //...
}
```

## Handling Events
For the unidirectional data flow pattern, the state should only change in response to an event.

There are two decorators available to help setup event listeners on both the host (the UI element) and 
the window.

Window events are great for application level communication, whereas, host events are better suited
for local changes that occur in the element that the StateController is attached to (or any child elements).

```js
import { StateController } from "@domx/statecontroller";
import { stateProperty, hostEvent, windowEvent } from "@domx/statecontroller/decorators";

export class SomeController extends StateController {
    @hostEvent(SomeHostEvent)
    someHostEvent(event:SomeHostEvent) {
        this.state = {/*...*/};
        this.requestUpdate(event);
    }

    @windowEvent(SomeWindowEvent)
    someWindowEvent(event:SomeWindowEvent) {
        this.state = {/*...*/};
        this.requestUpdate(event);
    }
}
```
> Both decorators require an event that has a static `eventType` property on them.
> Since these are just DOM events, the decorators are not required if you have some other
way of setting up listeners.

### Event Bubbling
When the event is meant for the window or could be fired by child elements, make sure to set the
bubbles and composed options in the event constructor to true.
```js
export class SomeEvent extends Event {
    static eventType = "some-event";
    constructor() {
        super(SomeEvent.eventType, {bubbles: true, composed: true});
    }
}
```
### Event Capturing
By default, all events handled when using the decorators have `stopImmediatePropagation` called on the event
so it is not handled by multiple controllers.

There are some cases where you may want multiple controllers to handle the same event. For this, you can
set a `capture` option to false.
```js
@windowEvent(SomeWindowEvent, {capture: false})
someWindowEvent(event:SomeWindowEvent) {
    this.state = {/*...*/};
    this.requestUpdate(event);
}
```


## StateController "instances"
In some cases, the state that the controller contains is specific to an instance.
For example, a specific User or Product.

To keep instance state separate, the UI element can declare a `stateId` getter.

```js
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SomeStateController } from "./SessionStateController";

@customElement("user-card")
class UserCard extends LitElement {

    // declaring a stateId
    get stateId() { return this.userId; }

    @property({type:String, attribute: "user-id"})
    userId:string;

    user = new UserStateController(this);
}
```
> The UserStateController will use the `stateId` property on its host if it is defined.

### Requiring a stateId
Controllers that control instance type data can require using a stateId with a simple type constraint.
```js
class SomeStateController extends StateController {
    // this controller requires a stateId on the host
    constructor(host:LitElement & {stateId:string}) {
        super(host);
    }
}
```

### `refreshState()` for stateId changes
If the host elements stateId changes, the internal state of the StateController will be out of sync.
Calling `refreshState()` on the controller will check if the stateId has in fact changed,
and if so, the controllers `hostDisconneced` and `hostConnected` methods will be called.

To force a state refresh, you can call `refreshState(true)`.

> If you are using the event decorators, `refreshState()` is called for you.

#### **Design Note**
Because `refreshState` disconnects and reconnects the controller, it is not a good
idea to have state initialization in the `hostConnected` method. If there are
multiple state controllers in the DOM with the same stateId, this could cause
multiple requests to re-fetch data.

Instead, use a host or window event handler since when handled, the events do not
automatically propagate and state will be synced during the expected lifecycle.




## Requesting Updates
The `requestUpdate` method is a pass through to the `ReactiveController` requestUpdate method.

It also has an `event` argument which can be an instance of an `Event` class or a `string` description.

This event is primarily for logging and debugging purposes to track what action occurred to require the update.

See the [Root State and State Syncing](#root-state-and-state-syncing) section below. 


## Using Product (Immer)
Since LitElement works with immutable state, it can get tedious to make changes to large state objects.

[Immer](https://github.com/immerjs/immer) is a great library that simplifies state changes.


There is a `Product` "Monad like" class which integrates Immer with a StateController to provide a more
functional approach to state changes (similar to Redux reducers).

> See the **[Product](src/Product)** documentation.

**Using Immer directly**

The StateController makes the Immer `produce` method available if you would like to use it directly.
```js
import { produce } from "@domx/statecontroller/product";
import { StateController } from "@domx/statecontroller";
import { stateProperty, hostEvent } from "@domx/statecontroller/decorators";

export class SomeController extends StateController {
    @stateProperty()
    state = { foo: "bar" };

    @hostEvent(FooChangedEvent)
    someHostEvent(event:FooChangedEvent) {
        // using Immer's produce method directly
        this.state = produce(this.state, state => {
            state.foo = event.foo;
        });
        this.requestUpdate(event);
    }
}
```




## Root State and State Syncing
One of the features of the StateController is that all state in the controller is stored in a `RootState`
class. This allows state to be synced across the same StateController if used multiple times in the DOM.

The `RootState` class contains an object mapping to all state that is "connected" (in the DOM).
Every StateController has a state path / key that is used to reference its state in the `RootState`.

This key is the derived using "`<ClassName>.<StateId?>.<StateName>`".


### Initialization
When a StateControllers element is connected to the DOM, the state will be looked up using its key.
If found, the state is initialized with the state that is already connected to the DOM. If not found,
the controllers state will be pushed to the RootState.

### Change Propagation
Any time a call to `requestUpdate` is made, the state change is pushed to the `RootState`.
All connected controllers with the same state key are also updated.

### RootState
The RootState class has a small set of static methods. It is mostly used for internal purposes
but has a few methods that may be useful for logging/debugging purposes.

The most important being the **`addRootStateChangeEventListener`** which provides updates to
every change made to the RootState:
```js
import { RootState, RootStateChangeEvent } from "@domx/statecontroller"

const abortController = new AbortController();
RootState.addRootStateChangeEventListener((event:RootStateChangeEvent) => {
    const changeEvent = event.changeEvent; // the Event or string description for the change
    const rootState = event.rootState; // the key/object state mapping
    
    // add logging or a break point for debugging

}, abortController.signal);

// detach the listener
abortController.abort();
```
> The `RootStateChangeEvent` contains a handful of properties, the most useful being the `changeEvent`
and the `rootState`.

> The abort controller is optional and allows you to detach the listener when calling abort.




## Redux DevTools
The StateController contains a method that can connect the RootState to Redux DevTools.
```js
import { connectRdtLogger } from "@domx/statecontroller";

connectRdtLogger("my-logger");
```
> The method takes a single optional argument which will be the name of the RDT instance. The default
is the document title.

This method returns an instance of the logger which can be used to disconnect the logger.
```js
const rdtLogger = connectRdtLogger("my-logger");
rdtLogger.disconnect();
```





## StateController Composition
StateControllers can use other StateControllers which can provide for some
useful patterns and code re-use:
```js
class UserProductsController implements StateController {
  private userState: UserStateController;
  private productsState: ProductsStateController;

  constructor(host: LitElement) {
    this.userState = new UserStateController(host);
    this.productsState = new ProductsStateController(host);
  }

  get user() { return this.userState.user; }
  get userProducts() { return this.productsState.products; }
}
```
> The getters can also do additional transformations of the data specific to the
`UserProductsController`


### StateController.stateUpdated
Anytime the state is updated a noop `stateUpdated` method is called on the controller.

This allows controllers to react to other controllers being updated and can be useful during composition.
```js
class UserProductsController implements StateController {
  private userState: UserStateController;
  private productsState: ProductsStateController;

  constructor(host: LitElement) {
    this.userState = new UserStateController(host);
    this.userState.stateUpdated = this.stateUpdated;
    this.productsState = new ProductsStateController(host);
    this.productState.stateUpdated = this.stateUpdated;
  }

  // override the base class stateUpdated noop method
  stateUpdated() {
    // react to state change
  }

  get user() { return this.userState.user; }
  get userProducts() { return this.productsState.products; }
}
```



