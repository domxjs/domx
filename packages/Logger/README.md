# Logger &middot; [![Build Status](https://travis-ci.com/jhorback/harbor-utils.svg?branch=packages/Logger)](https://travis-ci.com/jhorback/harbor-utils)

[CHANGELOG](./CHANGELOG.md)


Can be used to add logging configuration to classes.

## Usage
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