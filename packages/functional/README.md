# functional &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.mit.edu/~amini/LICENSE.md) [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/functional)](https://travis-ci.com/github/domxjs/domx) [![Lines](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](https://app.travis-ci.com/github/domxjs/domx/branches) [![npm](https://img.shields.io/npm/v/@domx/functional)](https://www.npmjs.com/package/@domx/functional)


Contains methods for functional JavaScript patterns.

## Installation
```sh
npm install @domx/functional
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

### TypeScript
Both `pipe` and `compose` will infer the type of each functions argument and return value.
If needing to use different types you can use `<any>`.
```js
 const returnValue = pipe<any>(
    text => parseInt(text),
    num => num + 1,
    num => String(num) + " - it worked"
)("1");
// returnValue = "2 - it worked"
```


## Async Versions
`pipeAsync` and `composeAsync` can be used if any one of the methods in the chain is async or returns a promise.


