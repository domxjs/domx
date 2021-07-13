# debounce

The `debounce` function returns a function that is only called once during a set delay.

If setting the `immediate` option to true, the function executes at the beginning 
instead of at the end of the delay.

## TODO
Need to convert to TypeScript.

## Usage

### With functions
```js
import { debounce } from '../lib/functional/debounce.js';

const someOperation = debounce(() => {
  // do something
}, 300);
```

### With functions on a Class
```js
import { debounce } from '../lib/functional/debounce.js';

class SomeClass {

  someOperation = debounce(() => {
    // do something
  }, 300);
}
```

### With the decorator

```js
import { debounce } from '../lib/functional/decorators.js';

class SomeClass {

  @debounce(300)
  someOperation() {
    // do something
  }
}
```

## Note on debouncing DOM events handlers

If using the data element pattern it is usally better to debounce the DOM event handler at the UI element. This cuts down on logging chatty UI events and performs better since the data element only gets the event once.

`Important:` since a DOM event could be handled some time after it was originally dispatched, the `event.target` may not be what is expected since this can change with event composition and bubbling.
