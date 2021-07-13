# Middleware &middot; [![Build Status](https://travis-ci.com/jhorback/harbor-utils.svg?branch=packages/Middleware)](https://travis-ci.com/jhorback/harbor-utils)


## Installation
```sh
npm install @harbor/middleware
```


## Middleware
A class that can be used to implement a middleware pattern.


## Logger

Can be used to add logging configuration to classes.

### `loggerConfig` decorator

```js
@loggerConfig({
  onlyThis: true,
  level: debug
})
class SomeClass {

}
```


## `Logger.log` method
```js
Logger.log(obj, level, ...args);
```