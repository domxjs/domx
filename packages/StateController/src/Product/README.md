# Product


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
> The static method "`of`" is a lifting function that simply creates 
a new Product monad: `return new Product(controller, stateProperty)`

> `next` calls the function with the state so it can be mutated safely

> `requestUpdate` is a pass through to `controller.requestUpdate`

This pattern allows you to create many reusable chunks of state changes. When logic gets
more complex and there are more moving parts, this allows for more options to organize,
re-use, and test your functions.

## Other methods on Product
There are a small handful of other methods that you can use on Product.
All methods return the product monad itself so they are chainable.

### tap
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

### getState
This method returns the current state from the controller.
```js
const state = product.getState();
```

### dispatchHostEvent
This will dispatch a DOM event on the controllers host element.
```js
product.dispatchHostEvent(new Event("users-changed"));
```

### pipeNext
This is the same as `next` but allows for passing multiple methods in the same call.
```js
product.pipeNext(setIsLoading(true), resetPageCount);
// same as
product.next(setIsLoading(true)).next(resetPageCount);
```

### pipeTap
This is the same as `tap` but allows for passing multiple methods in the same call.
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