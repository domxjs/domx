# testUtils &middot; [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/testUtils)](https://travis-ci.com/domxjs/domx)

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

The html literal is from `lit-html` which provides for other usage patterns:
```js
@import {fixture, html} from  "@domx/testutils";

const userDetailsEl= userId => html`<user-details user-id="${userId}"></user-details>`;
const el = fixture(userDetailsEl(123));
el.restore();
```

The `fixture` supports typeing
```js
const el= fixture<UserDetails>(html`<user-details></user-details>`);
console.log(el.userId);
el.restore();
```
