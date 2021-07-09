# Logger

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