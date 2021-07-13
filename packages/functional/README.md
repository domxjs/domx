# Functional &middot; [![Build Status](https://travis-ci.com/jhorback/harbor-utils.svg?branch=packages/functional)

Contains methods for functional JavaScript patterns.

## Installation
```sh
npm install @harbor/functional
```

## Usage
Pipe and compose methods combine functions; calling each function with the output of the last one.

The primary difference is that a pipe is from left-to-right (top-to-bottom), where as compose is right-to-left (bottom-to-top).

### pipe
```js
const returnValue = pipe(
    (x) => x + 2,
    (x) => x * 3
)(1);
// returnValue = 9
```

### compose
```js
const returnValue = compose(
    (x) => x + 2,
    (x) => x * 3
)(1);
// returnValue = 5
```


## Async Versions
`pipeAsync` and `composeAsync` can be used if any one of the methods in the chain is async or returns a promise.


