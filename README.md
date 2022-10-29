# DOMX &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.mit.edu/~amini/LICENSE.md) [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=master)](https://travis-ci.com/github/domxjs/domx) ![Lines](https://img.shields.io/badge/Coverage-98.4%25-brightgreen.svg?style=flat) [![GitHub package.json version](https://img.shields.io/github/package-json/v/jhorback/harbor-utils)](https://github.com/jhorback/harbor-utils/releases)

A mono repo containing packages with common web application script utilities.

DOMX is an approach to building modern web applications using the DOM, browser, and patterns more so than relying on frameworks or libraries.
See: **[domxjs.com](https://www.domxjs.com/)**


All packages can be used independently, but for most cases the Router and/or DataElement packages are all that are needed.

The DataElement package includes exports for EventMap, StateChange, linkProp, and middleware.

## Packages

| Package   | Status   | Latest | Description
|:---       |:---      |:---    |:---
| [Router](https://github.com/domxjs/domx/tree/master/packages/Router) | [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/Router)](https://travis-ci.com/github/domxjs/domx) | [![npm](https://img.shields.io/npm/v/@domx/router)](https://www.npmjs.com/package/@domx/router) | A DOM based custom element router for client side routing
| [StateController](https://github.com/domxjs/domx/tree/master/packages/StateController) | [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/StateController)](https://travis-ci.com/github/domxjs/domx) | [![npm](https://img.shields.io/npm/v/@domx/statecontroller)](https://www.npmjs.com/package/@domx/statecontroller) | A StateController base class for handling data state changes on a LitElement
| [DataElement](https://github.com/domxjs/domx/tree/master/packages/DataElement) | [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/DataElement)](https://travis-ci.com/github/domxjs/domx) | [![npm](https://img.shields.io/npm/v/@domx/dataelement)](https://www.npmjs.com/package/@domx/dataelement) | A DataElement base class for handling data state changes
| [EventMap](https://github.com/domxjs/domx/tree/master/packages/EventMap) | [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/EventMap)](https://travis-ci.com/github/domxjs/domx) | [![npm](https://img.shields.io/npm/v/@domx/eventmap)](https://www.npmjs.com/package/@domx/eventmap) | A CustomElement class mixin for declarative DOM event handling
| [StateChange](https://github.com/domxjs/domx/tree/master/packages/StateChange) |[![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/StateChange)](https://travis-ci.com/github/domxjs/domx) | [![npm](https://img.shields.io/npm/v/@domx/statechange)](https://www.npmjs.com/package/@domx/statechange) | A monad-like object that enables changing a property on an HTMLElement in a functional way
| [linkProp](https://github.com/domxjs/domx/tree/master/packages/linkProp) | [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/linkProp)](https://travis-ci.com/github/domxjs/domx) | [![npm](https://img.shields.io/npm/v/@domx/linkprop)](https://www.npmjs.com/package/@domx/linkprop) | Contains methods for linking properties of DOM elements
| [testUtils](https://github.com/domxjs/domx/tree/master/packages/testUtils) | [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/testUtils)](https://travis-ci.com/github/domxjs/domx) | [![npm](https://img.shields.io/npm/v/@domx/testutils)](https://www.npmjs.com/package/@domx/testutils) | Common testing utility scripts
| [Middleware](https://github.com/domxjs/domx/tree/master/packages/Middleware) | [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/Middleware)](https://travis-ci.com/github/domxjs/domx) | [![npm](https://img.shields.io/npm/v/@domx/middleware)](https://www.npmjs.com/package/@domx/middleware) | Contains low level patterns for middleware and HTMLElement mixin logging
| [functional](https://github.com/domxjs/domx/tree/master/packages/functional) | [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/functional)](https://travis-ci.com/github/domxjs/domx) | [![npm](https://img.shields.io/npm/v/@domx/functional)](https://www.npmjs.com/package/@domx/functional) | Contains methods for functional JavaScript patterns

