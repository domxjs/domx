# Router &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.mit.edu/~amini/LICENSE.md) [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/Router)](https://travis-ci.com/github/domxjs/domx) [![Lines](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](https://app.travis-ci.com/github/domxjs/domx/branches) [![npm](https://img.shields.io/npm/v/@domx/router)](https://www.npmjs.com/package/@domx/router)


A DOM based custom element router for client side routing

> This package is in active development.

## Installation
```sh
npm install @domx/router
```

## To Document as Primary Usage [Review]



## Patterns
```
Patterns starts with "/"
pattern="/"

routeParams
/users/:id
/users/:id/stats/:year
All route parameters are added as attributes on the element created.
Also, a .queryParams property will be set on the element with any search parameters

optional
/users(/)
/users(/:id)
/users(/stats)(/:year)

Subroutes
/users/*nameOfRouteParam
Creates a routeTail for use with subroutes,
and adds a route parameter called nameOfRouteParam
which is added as an attribute on the element created.
The routeTail can be used to set a parentRoute property of another route.
```


## Router
Static
- Router.pushUrl(url)
- Router.replaceUrl(url)
- Router.replaceUrlParams(params)
- Router.root - can set once