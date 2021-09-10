# EventMap &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.mit.edu/~amini/LICENSE.md) [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/EventMap)](https://travis-ci.com/github/domxjs/domx) ![Lines](https://img.shields.io/badge/Coverage-94.84%25-brightgreen.svg) [![npm](https://img.shields.io/npm/v/@domx/eventmap)](https://www.npmjs.com/package/@domx/eventmap)


A CustomElement class mixin which supports attaching and detaching DOM events declaratively.

## Installation
```sh
npm install @domx/eventmap
```

## Usage
There are two ways to use the mixin. Using decorators or by adding static properties to the class.

### Using Decorators
```js
import { eventsListenAt, events } from "@domx/eventmap";

@eventsListenAt("parent")
class MyCass extends EventMap(HTMLElement) {

  @event("event-to-handle-at-parent")
  _someHandler(event) {
    // handle event...
  }

  @event("event-to-handle-at-window", {
    listenAt: "window"
  })
  _anotherHandler(event) {
    // handle event...
  }
}
```
#### `@eventsListenAt(target, options?)` decorator
The `eventsListenAt` decorator can be used on a class to define where to add event listeners by default.

**Possible target values** 
- self (the default behavior)
- parent
- window

**options**
 - stopPropagation - default is true; set to false to allow event propagation.
 - stopImmediatePropagation - set to true to call `stopImmidiatePropagation` on all events.

#### `@event(name, options?)` decorator
Add the `event` decorator on methods to handle the event.

**options**
- listenAt - overrides the defulat `listenAt` property for this event.
- stopPropagation - overrides the defulat `stopPropagation` property for this event.
- stopImmediatePropagation - overrides the defulat `stopImmediatePropagation` property for this event.

### Using Static Properties
There are four static properties that can be set on a class to
define how events should be handled.
- eventsListenAt - sets the defaults for all events
- eventsStopPropagation - sets the default for all events
- eventsStopImmediatePropagation - sets the default for all events
- events - defines the event mapping from event name to handler and options
```js
class MyCass extends EventMap(HTMLElement) {

  static eventsListenAt = "window";
  static eventsStopPropagation = true;
  static eventsStopImmediatePropagation = false;

  static events = {
    "event-to-handle-at-parent": "_someHandler",
    "event-to-handle-at-window": {
      listenAt: "window",
      handler: "_anotherHandler",
      stopPropagation: true,
      stopImmediatePropagation: false
    }
  };

  _someHandler(event) {
    // handle event...
  }

  _anotherHandler(event) {
    // handle event...
  }
}
```

## Logging and Middleware
`EventMap` supports adding middleware to add custom behaviors.
You can also use the `applyEventMapLogging` method to log
event  information to the console.

**Add Logging**
```js
import {applyEventMapLogging} from "@domx/eventmap/applyEventMapLogging";

applyEventMapLogging();

// or call with collapsed:true to collapse console logging groups
applyEventMapLogging({collapsed:true});
```

**Applying Custom Middleware**
```js
import {EventMap} from "@domx/eventmap";

EventMap.applyMiddleware(handlerInfo => next => () => {
  // add custom behaviors and call next
  next();
});
```


## Notes on Behavior
### Multiple event maps
If any mixin or class uses the EventMap, all subclass and mixin event maps will be merged.

The event maps higher in the chain will take precident.
