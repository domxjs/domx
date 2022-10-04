# TestUtils &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.mit.edu/~amini/LICENSE.md) [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/TestUtils)](https://travis-ci.com/github/domxjs/domx) [![Lines](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg?style=flat)](https://app.travis-ci.com/github/domxjs/domx/branches) [![npm](https://img.shields.io/npm/v/@domx/testutils)](https://www.npmjs.com/package/@domx/testutils)


Common testing utility scripts.

## Installation
```sh
npm install @domx/testutils
```
## `fragment`
The test fragment can be used to test HTML elements that need to be appended to the DOM.
```js
@import {fixture, html} from  "@domx/testutils";

const el = fixture(html`<my-element></my-element>`);
el.restore();
```

> The html literal is from `lit-html` which provides for other usage patterns:
```js
@import {fixture, html} from  "@domx/testutils";

const userDetailsEl= userId => html`<user-details user-id="${userId}"></user-details>`;
const el = fixture(userDetailsEl(123));
el.restore();
```

> The `fixture` supports typing
```js
const el= fixture<UserDetails>(html`<user-details></user-details>`);
console.log(el.userId);
el.restore();
```
