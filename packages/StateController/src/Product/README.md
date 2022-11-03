# Product


Since `LitElement` works with immutable state, it can get tedious to make changes to large state objects.

[Immer](https://github.com/immerjs/immer) is a great library that simplifies state changes.


`Product` is a "Monad like" class which integrates Immer with a StateController which supports a
functional approach to state changes (similar to Redux reducers).


## Basic Example
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
> This pattern allows you to create many reusable chunks of state changes. When logic gets
more complex and there are more moving parts, this allows for more options to organize,
re-use, and test your functions.

### Product.of(controller, stateProperty)
The static method "`of`" is a lifting function that simply creates 
a new Product monad, and is the same as:
```js
const product = new Product(controller, stateProperty)
```
### product.next(fn)
The `next` method calls the provided function with the state so it can be mutated safely, then
returns the product so it can be chained.

### product.requestUpdate(event)
This a pass through to `controller.requestUpdate(event)` and returns the product so it can be chained.


## Other methods on Product
There are a small handful of other methods that you can use on a product;
all methods (except getState) return the product monad itself so they are chainable.

### product.tap(fn)
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
Another option besides calling `product.next` after the asynchronous code, is to dispatch another event
to handle the response on the controller class.
```js
const requestUsers = async product => {
    const response = await fetch("/users");
    const users = await response.json();
    product.dispatchHostEvent(new UsersReceivedEvent(users));
};
```
> Now the controller can add a method that handles the event and updates state.
That is a little more effort, but some may prefer that pattern.

### product.getState()
This method returns the current state from the controller.
```js
const state = product.getState();
```

### product.dispatchHostEvent(event)
This will dispatch a DOM event on the controllers host element.
```js
product.dispatchHostEvent(new Event("users-changed"));
```

### product.pipeNext(fns)
This is the same as `product.next` but allows for passing multiple methods in the same call.
```js
product.pipeNext(setIsLoading(true), resetPageCount);
// same as
product.next(setIsLoading(true)).next(resetPageCount);
```

### product.pipeTap(fns)
This is the same as `product.tap` but allows for passing multiple methods in the same call.
```js
product.pipeTap(requestUsers, requestProducts);
// same as
product.tap(requestUsers).tap(requestProducts);
```
### Product functional static methods
`Product` also has a handful of static methods that do the same things as the methods noted above,
but can be used with a functional programming style to support composition patterns
familiar to those who like that style.
* **`Product.nextWith(product)`** - a lifting function that calls next
* **`Product.tapWith(product)`** - a lifting function that calls tap
* **`Product.requestUpdate(event)`** - a chainable call to requestUpdate
* **`Product.dispatchHostEvent(event)`** - a chainable call to dispatchHostEvent
* **`Product.next(fn)`** - a chainable call to next
* **`Product.tap(fn)`** - a chainable call to tap
* **`Product.getState(product)`** - a chainable call to getState