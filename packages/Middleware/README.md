# Middleware &middot; [![Build Status](https://travis-ci.com/jhorback/harbor-utils.svg?branch=packages/Middleware)](https://travis-ci.com/jhorback/harbor-utils)


## Installation
```sh
npm install @harbor/middleware
```


## Middleware
A class that can be used to implement a middleware pattern.


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
    Logger.log(this, "log", "This will NOT log");
  }
}
customElements.define("some-class", SomeClass);
```


## `Logger.log` method
To be used by the HTMLElement class mixins to allow user control of log output.
```js
Logger.log(this, "console", "Log this", "and this");
```