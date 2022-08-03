# Middleware &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.mit.edu/~amini/LICENSE.md) [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/Middleware)](https://travis-ci.com/github/domxjs/domx) [![Lines](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg?style=flat)](https://app.travis-ci.com/github/domxjs/domx/branches) [![npm](https://img.shields.io/npm/v/@domx/middleware)](https://www.npmjs.com/package/@domx/middleware)


Contains low level patterns for middleware and HTMLElement mixin logging.

## Installation
```sh
npm install @domx/middleware
```


## Middleware
A class that can be used to implement a middleware pattern.
Middleware can be used for common concerns such as logging, error handling, reporting, etc.

### Adding middleware
The Middleware class is to be used by modules wanting to expose middleware.
```js
export {useMiddleware};
const mw = new Middleware();
const useMiddleware = (fn) => mw.use(fn);
```

### Executing middleware
There are two function structures that can be used when executing the middleware.
Both take a `next` method and an arguments array to be passed to the `next` function.
Each middleware function is required call the `next` function with
arguments and return the `next` functions return value.

#### Full Example
`TestMiddleware.ts`
```js
import {Middleware} from "@domx/middleware";
export {TestMiddleware, useMiddleware};

interface MwContext {
    test: Array<string>
}

const mw: Middleware = new Middleware();
const useMiddleware: Function = (fn: Function) => mw.use(fn);

class TestMiddleware {
    logTest() {
        const context = {test: ["it"]};
        const returnValue = mw.execute((context: MwContext) => {
            context.test.push("work");
            return "!";
        }, [context]);
        context.test.push(returnValue);
        return context.test.join(" ");
    }
}

```
`addMiddleware.ts`
```js
import {useMiddleware} from "./TestMiddleware";

useMiddleware((next: Function) => (context: MwContext) => {
    context.test.push("did");
    return next(context);
});

```
`runTest.ts`
```js
import {TestMiddleware} from "./TestMiddleware";
import "./addMiddleware.ts";
const testMw = new TestMiddleware();
const returnValue = testMw.logTest();
console.log(returnValue); // logs: "it did work!"
```

#### Using Mapped Arguments
In some cases it may be useful to map an argument to all of the middleware functions before execution.
This would allow for the following middleware function signagure:
```js
const middlewareFunction = mappedArgument => next => passedArgument => {
  // do something with mappedArgument
  return next(passedArgument);
};
```
> Use `mapThenExecute` to run this middleware function signature.
```js
const mw = new Middleware();
mw.use(middlewareFunction);
mw.mapThenExecute((mappedFunction, nextFn, passedArgument));
```


## Logger

A logger to be used by mixins of HTMLElement classes.

It supports logging only certain console method calls and a `logOnly` setting which will filter
out any log messages from this logging implementation that do not have `logOnly` set to true.

### `loggerConfig` decorator
Any classes that include mixins that use the logger can use the `loggerConfig` decorator to filter console log output.
```js
@loggerConfig({
  onlyThis: true,
  level: "debug"
})
class SomeClass extends SomeMixinThatLogs(HTMLElement) {
  someMethod() {
    Logger.log(this, "debug", "This will log");
    Logger.log(this, "log", "This will log but at the set 'debug' level.");
  }
}
customElements.define("some-class", SomeClass);
```


## `Logger.log` method
To be used by the HTMLElement class mixins to allow user control of log output.
```js
Logger.log(this, "console", "Log this", "and this");
```