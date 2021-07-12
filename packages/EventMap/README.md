# EventMap.js

[CHANGELOG](./CHANGELOG.md)


## Description
A CustomElement class mixin which supports attaching and detaching DOM events declaratively.

## Usage
When "some-dom-event" is dispatched, the "_someHandler" method gets called;
__stopPropagation()__ is called on the event before passing it to the handler.

```js
class MyCass extends EventMap(HTMLElement) {
  static events = {
    "some-dom-event": "_someHandler",
    "another-dom-event": "_anotherHandler"
  };

  _someHandler(event) {
    // handle event... *
  }

  _anotherHandler(event) {
    // handle event...
  }
}
```

## Listening at the parent or window
Each event can be configured to add the listener to its parent
or to the window object. By default the listeners are attached
to the element itself.

 ```js
class MyCass extends EventMap(HTMLElement) {
  static events = {
    "some-dom-event": "_someHandler",
    "event-to-handle-at-parent": {
      listenAt: "parent",
      handler: "_someHandler2"
    },
    "event-to-handle-at-window",  {
      listenAt: "window",
      handler: "_someHandler3"
    }
  };

  _someHandler(event) {
    // handle event...
  }

  _someHandler2(event) {
    // handle event...
  }

   _someHandler3(event) {
    // handle event...
  }
}
```

## Changing the default
The default can be changed from the element itself to "window" or "parent"
using a static eventsListenAt property:
```js
class MyCass extends EventMap(HTMLElement) {
  static eventsListenAt = "window";
}
```

## Decorator usage
There are two decorators that can be used instead of the static `events` and `eventsListenAt` properties.
```js
@eventsListenAt("parent")
class MyCass extends EventMap(HTMLElement) {

  @event("event-to-handle-at-parent")
  _someHandler(event) {
    // handle event...
  }

  @event("event-to-handle-at-window, {listenAt: "window"})
  _someHandler2(event) {
    // handle event...
  }
}
```


## Multiple event maps
If any mixin or class uses the EventMap, all subclass and mixin event maps
will be merged.

The event maps higher in the chain will take precident.
