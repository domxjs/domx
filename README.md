# Harbor Utilities &middot; ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg) [![Build Status](https://travis-ci.com/jhorback/harbor-utils.svg?branch=master)](https://travis-ci.com/jhorback/harbor-utils)
@harbor-utils

A mono repo containing packages with common web application script utilities.

## Packages

| Package   | Status   | Notes
|:---       |:---      |:---
| [EventMap](https://github.com/jhorback/harbor-utils/tree/master/packages/EventMap) | [![Build Status](https://travis-ci.com/jhorback/harbor-utils.svg?branch=packages/EventMap)](https://travis-ci.com/jhorback/harbor-utils) | Converting to TypeScript 
| [StateChange](https://github.com/jhorback/harbor-utils/tree/master/packages/StateChange) | | Needs conversion 
| linkProp || Needs conversion 
| Middleware | [![Build Status](https://travis-ci.com/jhorback/harbor-utils.svg?branch=packages/Middleware)](https://travis-ci.com/jhorback/harbor-utils) | Finishing implementation and tests
| [functional](https://github.com/jhorback/harbor-utils/tree/master/packages/functional) | [![Build Status](https://travis-ci.com/jhorback/harbor-utils.svg?branch=packages/functional)](https://travis-ci.com/jhorback/harbor-utils) | 0.2.0 


<!-- | [debounce](./packages/debounce/README.md) | | Needs conversion -->

## Development

This mono repo uses NPM workspaces set to pull in any package in the `packages` folder.

There is a branch and travis matrix for each package to report build statuses for individual packages.

When develpoing, work on the branch for the specific package.
* Checkout branch
* Merge master
* Perform work
* Commit branch
* Merge back into master

### Adding a package
When adding a package, make sure to update the travis-ci matrix and add the package to the root README file.

