# DataElement &middot; [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/testUtils)](https://travis-ci.com/domxjs/domx)

A `DataElement` base class with root state support.

## Description
The `DataElement` base class provides a Flux/Redux style unidirectional data flow state management
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

See: [domxjs.com](https://domxjs.com/data-element), for more in depth examples and documentation.


## Installation
```sh
npm install @domx/dataelement
```

## Basic Usage
This is a contrived example showing default usage of a `DataElement`;

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

### UI Component
The `SessionData` element can be used in any UI component.

```js
import { customElement, LitElement, html } from "@lit-element";
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
            <div>
                Logged in as: ${state.loggedInUserName}
                (${state.loggedInUsersFullName})
            </div>
        `;
    }
}
```

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
