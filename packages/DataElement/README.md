# DataElement &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.mit.edu/~amini/LICENSE.md) [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/DataElement)](https://travis-ci.com/github/domxjs/domx) [![Lines](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](https://app.travis-ci.com/github/domxjs/domx/branches) [![npm](https://img.shields.io/npm/v/@domx/dataelement)](https://www.npmjs.com/package/@domx/dataelement)

A `DataElement` base class with root state support.

> This is a pre-release.
> Features are complete and testing is being performed in different proejcts.


[Description](#description) \
[Highlights](#highlights) \
[Installation](#installation) \
[Basic Usage](#basic-usage) \
[Registering a DataElement](#registering-a-dataelement) \
[Describing Data Properties](#describing-data-properties) \
[Handling Events and Dispatching Changes](#handling-events-and-dispatching-changes) \
[Setting a stateId Property](#setting-a-stateid-property) \
[Using Immer](#using-immer) \
[Using StateChange](#using-statechange) \
[Middleware and RDT Logging](#middleware-and-rdt-logging)

## Description
The `DataElement` base class provides for a Flux/Redux style unidirectional data flow state management
pattern using DOM events and custom elements.

By utilizing the DOM and custom elements the footprint is small and 
performance is fast since communication happens through
DOM events and not a JavaScript library.

It works well with `LitElement` since that also uses custom elements,
but since it is a custom element itself, it will work with any (or no)
library/framework.

Using DataElements does not have the boilerplate of Redux and is more like
using the [React context api](https://reactjs.org/docs/context.html).
It also provides for the dynamic state creation abilities of 
[recoil](https://recoiljs.org/).

See: [domxjs.com](https://domxjs.com/data-elements) for more information.

## Highlights
- Works with Redux Dev Tools.
- Can configure any (and multiple) properties to be the `state` property.
- Can use/configure a `stateId` property to track state for instance data.
- Works with (but does not require) the [StateChange](https://github.com/domxjs/domx/tree/master/packages/StateChange) monad for `functional` JavaScript patterns (e.g. `reducers`)
  - `StateChange` also works with [Immer](https://github.com/immerjs/immer) which
  eliminates object creation fatigue when working with immutable state.
- Uses [EventMap](https://github.com/domxjs/domx/tree/master/packages/EventMap)
for declarative DOM event handling on custom elements.
- Top question: "can it really be that simple?"


## Installation
```sh
npm install @domx/dataelement
```

## Basic Usage
This is a contrived example showing default usage of a DataElement.

```js
import { customDataElement, DataElement, event } from "@domx/dataelement";

@customDataElement("session-data", {
    eventsListenAt: "window"
});
export class SessionData extends DataElement {
    static defaultState = {
        loggedInUserName: "",
        loggedInUsersFullName: ""
    };

    state = SessionData.defaultState;

    // event creator
    static userLoggedInEvent = (userName, fullName) => 
        new CustomEvent("user-logged-in", {
            bubbles: true,
            composed: true,
            detail: {userName, fullName}
        });

    @event("user-logged-in")
    userLoggedIn({detail:{userName, fullName}}) {
        this.state = {
            ...this.state,
            loggedInUserName: userName,
            loggedInUsersFullName: fullName
        };
        this.dispatchEvent(new CustomEvent("state-changed"));
    }
}
```
> The static `userLoggedInEvent` is a good pattern to use
to expose what events a DataElement can handle. This is
similar to action creators in Redux. They can be defined
directly on the DataElement (or in a separate file
if that works better for you) and used by UI components
to trigger events.

> The same goes for the static `defaultState` property. This allows
for UI components to reference the `defaultState` for initialization.

### UI Component
The `SessionData` element can be used in any UI component.

```js
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators";
import { linkProp } from "@domx/linkProp";
import { SessionData } from "./SessionData";

class LoggedInUser extends LitElement {
    state = SessionData.defaultState;

    render() {
        const state = this.state;

        return html`
            <session-data
                @state-changed="${linkProp(this, "state")}"
            ></session-data>
            <button @click="${this.updateUserClicked}">Update user</button>
            <div>
                Logged in as: ${state.loggedInUserName}
                (${state.loggedInUsersFullName})
            </div>
        `;
    }
    
    updateUserClicked(event) {
        this.dispatchEvent(SessionData.userLoggedInEvent("juser", "Joe User"));
    }
}
```

## Registering a DataElement
There are two ways to register a DataElement.

### Using a Decorator
```js
@customDataElement("user-data")
class UserData extends DataElement {
    // ...
}
```
> This will register the custom element with the specified name
and will use the specified name in the root state tree.

#### **@customDataElement(name, options)**
The name is the name of the custom element.

**options**
- **stateIdProperty** - sets a stateId property name for instance data;
see [Setting a stateId Property](#setting-a-stateid-property).
- **eventsListenAt** - sets the default event listener; can be "window", "parent", "self"
(self is the default); see [EventMap](https://github.com/domxjs/domx/tree/master/packages/EventMap).

### Without a Decorator
```js
class UserData extends DataElement {
   static eventsListenAt = "window";
   static stateIdProperty = "state"; // this is the default;
   // ...
}
customDataElements.define("user-data", UserData);
```
> The `eventsListenAt` and `stateIdProperty` static properties are optional.


## Describing Data Properties
The default data property is `state`. However, you can set any and multiple 
properties to be a data property.

Data properties can be defined using a decorator or by using static properties.
### Using a Decorator
```js
class UserData extends DataElement {
    @dataProperty()
    user = {};

    @dataProperty({changeEvent: "session-data-changed"})
    sessionData = {};
}
```
> The above example sets the `user` property as a data property. The change event
monitored will be `"user-changed"`.

> A second data property here is `sessionData` which specifically defines the
change event as `"session-data-changed"`.

### Using the Static Property
A static property can also be used to define the data properties.
```js
class UserData extends DataElement {
    static dataProperties = {
        user: {}, // user-changed is the implied change event
        sessionData: {changeEvent: "session-data-changed"}
    };

    user = {};
    sessionData = {};
}
```

## Handling Events and Dispatching Changes
The DataElement uses [EventMap](https://github.com/domxjs/domx/tree/master/packages/EventMap)
for declarative event changes.

After making changes to a data property, a change event will need to be triggered on the data element.

This can be done by calling `this.dispatchEvent(new CustomEvent("state-change"))` where `state-change`
is the name of the change event. Or for convenience, you can call the `dispatchChange()` method.

**dispatchChange(prop = "state")**
```js
@customDataElement("user-data")
class UserData extends DataElement {

    @dataProperty()
    user = {
        userName: "unknown",
        fullName: "unknown",
    };

    @event("fullname-updated")
    userUpdated({detail:{fullName}}) {
        this.state = {
            ...this.state,
            fullName
        };
        this.dispatchChange("user");
    }

    @event("username-updated")
    userUpdated({detail:{userName}}) {
        this.dispatchChange("user", {
            ...this.state,
            userName
        });
    }
}
```
> Note: the `username-updated` event handler passes the state as a second parameter;
when doing this, it does a quick JSON.stringify comparison between the existing
and new state and only dispatches the changes if they differ.


## Setting a stateId Property
Using a stateId enables having multiple instances of the same data element in the DOM that keep
track of state per instance.

The stateId property name can be defined either by setting a static property on the class or with the
`customDataElement` decorator.

The default stateIdProperty is "stateId". If this property has a value then the state 
will be stored in its own slot in the root state tree.

### Using the decorator
```js
@customElement("user-data", { stateIdProperty: "userId"})
class UserData extends DataElement {
    userId = null;
    //...
}
```

### Using the static property
```js
class UserData extends DataElement {
    static stateIdProperty = "userId";

    userId = null;
    //...
}
customDataElements.define("user-data", UserData);
```

### Handling stateId Change
> Attribute changes should be driven by another DataElements state,
otherwise state could get out of sync with Redux Dev Tool logging.

In some cases, the stateId may be fed by a DOM attribute.
If that attribute changes, or internally the `stateId` property changes,
then the internal state will need to be refreshed.

This can be done by calling `refreshState()` on the DataElement.

#### Example
```js
@customDataElement("user-data", {stateIdProperty: "userId"})
class UserData extends DataElement {
    
    static get observedAttributes() { return ["user-id"]; }
    static defaultState = { userName: "unknown" };

    // tying the userId property to the user-id attribute
    get userId():string { return this.getAttribute("user-id") || ""; }
    set userId(stateId:string) { this.setAttribute("user-id", stateId); }

    @dataProperty();
    user = UserData.defaultState;

    attributeChangedCallback(name:string, oldValue:string, newValue:string) {
        if (name === "user-id") {            
            // the user-id is changing so we need to
            // refresh the state with the default state
            this.refreshState({
                user: UserData.defaultState
            });
        }
    }
}
```
> The static `observedAttributes` property and the `attributeChangedCallback` method
are part of the custom element definition.
See [Using Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).


## Using Immer
Working with immutable state can cause extra work to make sure all of the changes are propagated
correctly so that they can be identified and correctly updated by view components.

[Immer](https://github.com/immerjs/immer) is a great library that can remove the need to
perform much of that overhead.
### Example
```js
import {customDataElement, event} from "@domx/dataelement";
import { produce } from "immer";

@customDataElement("user-data")
class UserData extends DataElement {

    state = {
        fullName: "unknown"
    };

    @event("user-updated")
    userUpdated({detail:{fullName}}) {
        // Immers produce method takes care of update the
        // immutable state correctly
        this.state = produce(this.state, (state) => {
            state.fullName = fullName;
        };
        this.dispatchChange();
    }
}
```
> This example is very simple but, in many cases, changing multiple parts
of the state object and adding to or removing items from Arrays
can be greatly simplified by using Immer.

## Using StateChange
`StateChange` is another great option for updating state and
it can also be configured to use Immer.

In addition, using `StateChange` provides for more granular logging updates
including pushing to Redux Dev Tools so every update is recorded.

StateChange can provide for a pattern similar to Redux reducers (which is up to you),
but it also enables re-using state updates among different events. It also 
supports asynchronous changes using a `tap` method.

See the [StateChange repository](https://github.com/domxjs/domx/tree/master/packages/StateChange)
for more information.

`StateChange` is included as an DataElement export.
### Example
```js
import {customDataElement, event, StateChange, applyImmerToStateChange} from "@domx/dataelement";

// this can be called just once for the entire application,
// so it can be added in a root page.
applyImmerToStateChange();

@customDataElement("user-data")
class UserData extends DataElement {

    state = {
        fullName: "unknown"
    };

    @event("user-updated")
    userUpdated({detail:{fullName}}) {
        StateChange.of(this)
            .next(updateFullName(fullName))
            .dispatch();
    }
}

const updateFullName = fullName => state => {
    state.fullName = fullName
};
```

## Middleware and RDT Logging
`DataElement` exposes middleware to hook into both the `connectedCallback` and
`disconnectedCallback` methods.

There is also a function available to apply Redux dev tool logging.

### Redux Dev Tool Logging
Logs change events and if usining `StateChange` logs state snapshots
with each `next` call.
```js
import {applyDataElementRdtLogging} from "@domx/DataElement/middleware";
applyDataElementRdtLogging();
```
#### **applyDataElementRdtLogging(options)**
**options**
- logChangeEvents - set to false if using `StateChange` and do not want the additional
change event logged.
- exclude - an array of strings that excludes any events/actions from being logged that start with the exclude string.
> This can be used alongside `RootState.snapshot(name)` to create a named snapshot in Redux Dev Tools.

### Adding custom middleware
```js
import {DataElement} from "@domx/DataElement";

const connectedCallback = (metaData:DataElementMetaData) => (next:Function) => () => {
    // add custom behaviors and call next
    next();
};

const disconnectedCallback = (metaData:DataElementMetaData) => (next:Function) => () => {
    // add custom behaviors and call next
    next();
};

DataElement.applyMiddlware(connectedCallback, disconnectedCallback);

// removes all middelware methods
DataElement.clearMiddleware();
```

