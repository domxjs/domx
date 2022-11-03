# StateController &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.mit.edu/~amini/LICENSE.md) [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/StateController)](https://travis-ci.com/github/domxjs/domx) [![Lines](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg?style=flat)](https://app.travis-ci.com/github/domxjs/domx/branches) [![npm](https://img.shields.io/npm/v/@domx/statecontroller)](https://www.npmjs.com/package/@domx/statecontroller)


The `StateController` is a [Reactive Controller](https://lit.dev/docs/composition/controllers/)
that provides state to a `LitElement`.


[Highlights](#highlights) \
[Installation](#installation) \
[Basic Usage](#basic-usage) \
[Defining State Properties](#defining-state-properties) \
[Handling Events](#handling-events) \
[StateController "instances"](#statecontroller-instances) \
[requestUpdate](#requestupdate) \
[Using Product (Immer)](@using-product-immer) \
[Root State and State Syncing](#root-state-and-state-syncing) \
[Redux DevTools](#redux-devtools)
[StateController Composition](#stateController-composition)


### Highlights
* Its simple to use.
* It helps keep state changes and business logic out of the UI layer.
* Supports the unidirectional data flow state management pattern.
* Tracks a global state tree to sync state changes across controllers. 
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

export class SessonStateController extends StateController {

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
```
> By subclassing the Event class, The `UserLoggedInEvent` acts 
as a great way to document what events a StateController can handle.
This is similar to action creators in Redux. They can be defined
in the same file as the DataElement (or in a separate file
if that works better for you) and used by UI components
to trigger events.


### UI Component
The `SessonStateController` can be used with any LitElement.

```js
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { SessonStateController, UserLoggedInEvent } from "./SessonStateController";

@customElement("current-user)
class CurrentUser extends LitElement {
    session = new SessonStateController(this);

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
To set a property as a state property, simply use the `@stateProperty()` decorator.

This can also be done by defining a static field on the controller.
```js
export class SessonStateController extends StateController {
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


## StateController "instances"
In some cases, the state that the controller contains is specific to an instance.
For example, a specific User or Product.

To keep instance state separate, the UI element can declare a `stateId` getter.

```js
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SomeStateController } from "./SessonStateController";

@customElement("user-card)
class UserCard extends LitElement {

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
    // pattern for the controller to require a stateId on the host
    constructor(host:LitElement & {stateId:string}) {
        super(host);
    }
}
```

## requestUpdate
The `requestUpdate` method is a pass through to the `ReactiveController` requestUpdate method.

It also has an `event` argument which can be an instance of the `Event` class or a string description.

This event is primarily for logging and debugging purposes to track what action occurred to require the update.

See the [Root State and State Syncing](#root-state-and-state-syncing) section below. 



## Using Product (Immer)
Since LitElement works with immutable state, it can get tedious to make changes to large state objects.

[Immer](https://github.com/immerjs/immer) is a great library that simplifies state changes.


There is a `Product` "Monad like" class which integrates Immer with a StateController to provide a more
functional approach to state changes (similar to Redux reducers).

```js
import { StateController, Product } from "@domx/statecontroller";
import { stateProperty, hostEvent } from "@domx/statecontroller/decorators";

export class SomeController extends StateController {
    @stateProperty()
    state = { foo: "bar", isSet: false };

    @hostEvent(SomeHostEvent)
    someHostEvent(event:SomeHostEvent) {
        Product.of(this, "state")
            .next(setFoo(event.foo))
            .next(setIsSetToTrue)
            .requestUpdate(event);
    }
}

const setFoo = foo => state => {
    state.foo = foo;
};

const setIsSetToTrue => state => {
    state.isSet = true;
};
```
> The `of` static method is a lifting function that simply creates 
a new Product monad: `return new Product(controller, stateProperty)`

> `next` calls the function with the state so it can be mutated safely

> `requestUpdate` is a pass through to `controller.requestUpdate`

This pattern allows you to create many reusable chunks of state changes. When logic gets
more complex and there are more moving parts, this allows for more options to organize,
re-use, and test your functions. This is similar to reducers in Redux.

### Other methods on Product
There are a small handful of other methods that you can use on Product.
All methods return the product monad itself so they are chainable.

**tap**
The tap method is for branching / asynchronous methods. It receives the product monad itself
as its argument.
```js
Product.of(this, "state")
    .tap(requestUsers);

const requestUsers = async product => {
    const response = await fetch("/users");
    const users = await response.json();
    product.next(setUsers(users)).requestUpdate("requestUsers");
};
```
> Since tap is a branching function, you end up changing state again after some amount time.
Another option besides calling `product.next` after the async code, is to dispatch another event
to handle the response on the controller class.
```js
const requestUsers = async product => {
    const response = await fetch("/users");
    const users = await response.json();
    product.dispatchHostEvent(new UsersReceivedEvent(users));
};
```
> Now the controller can add a method that handles the event and updates state.
That is a little more effort but some may prefer that pattern.

**getState**
This method returns the current state from the controller.
```js
const state = product.getState();
```

**dispatchHostEvent**
This will dispatch a DOM event on the controllers host element.
```js
product.dispatchHostEvent(new Event("users-changed"));
```

**pipeNext**
This is the same as `next` but allows for passing multiple methods in the same call.
```js
product.pipeNext(setIsLoading(true), resetPageCount);
// same as
product.next(setIsLoading(true)).next(resetPageCount);
```
**pipeTap**
This is the same as `tap` but allows vor passing multiple methods in the same call.
```js
product.pipeTap(requestUsers, requestProducts);
// same as
product.tap(requestUsers).tap(requestProducts);
```
### Product functional static methods
Product also has a handful of static methods that do the same things as the methods noted above,
but can be used with a functional programming style to support composition patterns
familiar to those who like that style.
* **Product.nextWith(product)** a lifting function that calls next
* **Product.tapWith(product)** a lifting function that calls tap
* **Product.requestUpdate(event)**  a chainable call to requestUpdate
* **Product.dispatchHostEvent(event)** a chainable call to dispatchHostEvent
* **Product.next(fn)** a chainable call to next
* **Product.tap(fn)** a chainable call to tap
* **Product.getState(product)** a chainable call to getState


### Using Immer directly
The StateController makes the Immer `produce` method available if you would like to use it directly.
```js
import { produce } from "@domx/statecontroller/product";
import { StateController } from "@domx/statecontroller";
import { stateProperty, hostEvent } from "@domx/statecontroller/decorators";

export class SomeController extends StateController {
    @stateProperty()
    state = { foo: "bar" };

    @hostEvent(SomeHostEvent)
    someHostEvent(event:SomeHostEvent) {
        this.state = produce(this.state, state => {
            state.foo = "baz";
        });
    }
}
```




## Root State and State Syncing
One of the features of the StateController is that any state in the controller is stored in a `RootState`
class. This allows state to be synced across the same StateController if used multiple times in the DOM.

initialization
change propagation
RootState






## Redux DevTools







## StateController Composition
How can a state controller pull in multiple others and change it's state based on those others?
Research on Lit
```js
class DualClockController implements ReactiveController {
  private clock1: ClockController;
  private clock2: ClockController;

  constructor(host: ReactiveControllerHost, delay1: number, delay2: number) {
    this.clock1 = new ClockController(host, delay1);
    this.clock2 = new ClockController(host, delay2);
  }

  get time1() { return this.clock1.value; }
  get time2() { return this.clock2.value; }
}
```



TODO
// have to call stopPropagation on the events. And IEventOptions
@hostEvent(Event, { capture: false })
Move Product to a folder so the imports are
import { Product } from "@domx/statecontroller"
//or
import { Product } from "@domx/statecontroller/product"
//and
import { produce } from "@domx/statecontroller/product
// and a readme.md file will be there

