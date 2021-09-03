# EventMap &middot; [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/EventMap)](https://travis-ci.com/domxjs/domx)

A CustomElement class mixin which supports attaching and detaching DOM events declaratively.

There are two ways to use the mixin. Using decorators or by adding static properties to the class.

## Using Decorators
```js
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
### `@eventsListenAt` decorator
The `eventsListenAt` decorator can be used on a class to define where to add event listeners by default.

**Possible values** 
- self (the default behavior)
- parent
- window

### `@event` decorator
Add the `event` decorator on methods to handle the event.

The decorator takes a second argument to override the default `listenAt` property.



## Using Static Properties
The following example is identical in behavior to the above example using decorators.
```js
class MyCass extends EventMap(HTMLElement) {

  static eventsListenAt = "window";

  static events = {
    "event-to-handle-at-parent": "_someHandler",
    "event-to-handle-at-window": {
      listenAt: "window",
      handler: "_anotherHandler"
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


### Event Propagation
When an event handler is matched, __stopPropagation()__
is called on the event before passing it to the handler.
