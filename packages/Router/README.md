# Router &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.mit.edu/~amini/LICENSE.md) [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/Router)](https://travis-ci.com/github/domxjs/domx) [![Lines](https://img.shields.io/badge/Coverage-98.53%25-brightgreen.svg)](https://app.travis-ci.com/github/domxjs/domx/branches) [![npm](https://img.shields.io/npm/v/@domx/router)](https://www.npmjs.com/package/@domx/router)


A full featured DOM based custom element router for client side routing.


[Description](#description) \
[Installation](#installation) \
[Basic Usage](#basic-usage) \
[Route Patterns](#route-patterns) \
[Query Parameters](#query-parameters) \
[Element Creation](#element-creation) \
[Subroutes](#subroutes) \
[Route.Navigate](#route.navigate) \
[Route Events](#route-events) \
[Router](#router) \
[Public API](#public-api) \
[TypeScript Interfaces](#typescript-interfaces) \
[Redux Dev Tools](#redux-dev-tools)



## Description
The router is built with custom elements so it can be used by any code stack since it relies only on the DOM and the browser platform.
This makes the implementation very light and fast. It can also be configured to use Redux Dev Tools.

The main exports are the `Router` class which contains static methods for updating the URL, and a `DomxRoute` custom element
used to define routes.

Examples use [*LitElement*](https://lit.dev/) for its simplicity.

## Installation
```sh
npm install @domx/router
```

## Basic Example
This basic example shows two routes. Note that nothing special needs to be done to the links on the page.
They are just standard HTML hyperlinks. If a route is configured whose pattern matches a link href, then it will be triggered.

The two main attributes of `domx-route` elements are the `pattern` and the `element` attributes. When a link is clicked that matches
a route pattern the element will be created and appended to the DOM.

The `append-to` attribute can be set to either "body", "parent", or to a DOM query.
- **body** - appends the element to the document body.
- **parent** (default) - appends the element to the shadow root of the custom element that the route is in.
- **DOM query** - a query selector used on the shadow root to find an element to append to.

> NOTE: There is also a way to take control of DOM insertion; this can be useful for adding animations.
See: [Route Events](#route-events).

```js
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators";
import "@domx/router/domx-route";
import "./example-page-1";
import "./example-page-2";

@customElement("example-app")
class ExampleApp extends LitElement {
    render() {
        return html`
            <nav>
                <ul><a href="/page1"></a>
                <ul><a href="/page2"></a>
            </nav>
            <domx-route
                pattern="/page1"
                element="example-page-1"
                append-to="#container"
            ></domx-route>
            <domx-route
                pattern="/page1"
                element="example-page-2"
                append-to="#container"
            ></domx-route>
            <main id="container"></main>
        `;
    }
}

```
> The `append-to` attribute in this example uses a DOM query for `#container` so the element will be appended to the `main` element. 

> Note: a `replace-state` attribute can be added to hyperlinks to use `history.replaceState` over `history.pushState`.
This may be desirable for something like tab navigation.


## Route Patterns
All patterns start with "/" and support exact matches, optional segments/parameters, route parameters, and route tails.

### Exact matches
The route is triggered if the URL matches the pattern exactly.
```html
<domx-route
    pattern="/user"
    element="app-user"
></domx-route>
<domx-route
    pattern="/user/home"
    element="app-user-home"
></domx-route>
```

### Optional URL Segments
Optional parameters are created using parentheses.
```html
<domx-route
    pattern="/user(/home)"
    element="app-user-home"
></domx-route>
```
> This pattern matches both `/user` and `/user/home`.

### Route Parameters
Route parameters create variables whose values are added as attributes on the
element created.
```html
<domx-route
    pattern="/users/:user-id"
    element="app-user"
></domx-route>
```
> Givent the url: `/users/1234`, this route will match and create the `app-user` element
with a `user-id` attribute set to `"1234"`.

### Optional Route Parameters
Route parameters can also use parentheses to denote they are optional.
```html
<domx-route
    pattern="/users/:user-id(/:tab)"
    element="app-user"
></domx-route>
```
> This route will match either `/users/1234` or `/users/1234/profile`; Both `user-id` and `tab` (if exists) will be set
as attributes on the `app-user` element.

### Route Tails (enabling subroutes)
Tails are created using an asterisk. Tails are used to capture any remaining parts of the URL and can be used for subroutes.
```html
<domx-route
    pattern="/attachments/*file-path"
    element="app-attachment"
></domx-route>
```
> This pattern would match `/attachments/path/to/file.ext` and add a `file-path` attribute
to the `app-attachment` element with the value: `"/path/to/file.ext"`.

> It also sets a read-only `tail` property on the element which is used internally to set parent routes which enables subroutes. See: [Subroutes](#subroutes).


## Query Parameters
A `queryParams` property is set on each element when created and they are kept
in sync with the current URLs search parameters as long as the route matches.
```html
<domx-route
    pattern="/search/users"
    element="user-search"
></domx-route>
```
> Given the url: `/search/users?userName=joe&status=active`
```js
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators";

@customElement("user-search")
class UserSearch extends LitElement {

    @property({type:Object, attribute:false})
    queryParams;

    render() {

        // access userName and status from queryParams
        const { userName, status } = this.queryParams;

        return html`
           <!-- User Search Page Content -->
        `;
    }
}
```


## Element Creation
There are five types of items that are added to an element when created.
- **routeParams** - for each matching route parameter, an attribute is added on the element with the route parameter name.
(parent route params are also added when the route is a subroute.)
- **queryParams** - a `queryParams` property is set on the element containing the query parameters in the current URL. This is updated as long as the route matches.
- **tail path** - an attribute is added to the element when using an asterisk; the name of the attribute is denoted by the text after the asterisk and the value is the remaining portion of the URL.
- **tail** - a `tail` property is set on the element if the pattern uses the asterisk. This is used internally for subroutes. It is an object that contains `prefix`, `path`, and `routeParams` properties.
- **parentRoute** - a `parentRoute` property is set when a route is created as a subroute. Its value is the `tail` of the parent route and can be used for subroutes.


## Subroutes
Subroutes allow routes to prefix their pattern with the parent routes tail. This enables  these routes to be agnostic of their parent.

There are two ways to create subroutes:
1. Using the same DOM tree.
2. With separate elements; which enables routes that can exist within multiple scopes.

### Using the same DOM tree
```js
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators";
import "@domx/router/domx-route";

@customElement("example-app")
class ExampleApp extends LitElement {
    render() {
        return html`
            <domx-route
                pattern="/users/*routeTail"
                element="example-users-page">
               
               <domx-route
                    pattern="/:userId"
                    element="example-user-page"
                ></domx-route>

            </domx-route>            
        `;
    }
}
```
> Here the subroute is created inside the parent and so the parents tail
is kept in sync with the child's parentRoute property.

### Using Separate Elements
Subrouting can also be accomplished in separate elements by setting the `parentRoute` property of a sub route.


```js
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators";
import "@domx/router/domx-route";
import "./user-page";
import "./users-profile";
import "./users-events-list";

@customElement("example-app")
class ExampleApp extends LitElement {
    render() {
        return html`
            <domx-route
                pattern="/user/:userId/*routeTail"
                element="user-page">
            </domx-route>           
        `;
    }
}

@customElement("user-page")
class UserPage extends LitElement {

    @property({type:Object, attribute: false})
    parentRoute;

    render() {
        return html`
            <domx-route
                .parentRoute="${this.parentRoute}"
                pattern="/profile"
                element="users-profile">
            </domx-route>  
            <domx-route
                .parentRoute="${this.parentRoute}"
                pattern="/events"
                element="users-events-list">
            </domx-route>
        `;
    }
}
```
> The `parentRoute` property of the `user-page` was added by the route in the `ExampleApp`.
This will prepend the matching part of the parent route to the pattern of the subroute.



## Route.navigate
It is generally recommended to use hyperlinks to trigger routes, however, there may be times where you need to do so programmatically.

If you know the full path to navigate to you can use `Router.pushUrl(url)` or `Router.replaceUrl(url)`. Otherwise, you can
call `navigate` on the route itself.

```js
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators";
import "@domx/router/domx-route";
import "./user-page"


@customElement("example-app")
class ExampleApp extends LitElement {

    @query("#userPageRoute")
    $userPageRoute;

    render() {
        return html`
            <button @click="${this.userPageButtonClicked}">User Page</button>
            <domx-route
                id="userPageRoute"
                pattern="/user/:userId"
                element="user-page">
            </domx-route>           
        `;
    }

    userPageButtonClicked(event) {
        this.$userPageRoute.navigate({
            routeParams: { userId: 1234 }
        })
    }
}
```
> Note: all routeParams in the pattern are required.
### Route.navigate(options)
- **replaceState** - set to true to use `history.replaceState` over `history.pushState`.
- **routeParams** - an object that defines all required route parameters.
- **queryParams** - used to pass any desired queryParameters on the URL.


## Route Events
There are two events triggered on a DomxRoute element: one when the route becomes active and another when it becomes inactive.

Both events send the same event detail parameters which contains an `element` and a `sourceElement`. The `element` is the element that is 
created when the route becomes active and the `sourceElement` is the `EventTarget` that triggered the route (which can be undefined).

`event.preventDefault()` can be called to keep the route from inserting or removing the element automatically. This may be useful
if you want to provide animation or some other form of custom/dynamic insertion.

The active event is also a great place to lazy load other custom elements required by that route.

### Example
```js
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators";
import "@domx/router/domx-route";


@customElement("example-app")
class ExampleApp extends LitElement {
    render() {
        return html`
            <domx-route
                id="userPageRoute"
                pattern="/users"
                element="user-list"
                @route-active="${this.usersRouteActive}"
                @route-inactive="${this.usersRouteInActive}"
            ></domx-route>           
        `;
    }

    usersRouteActive(event) {
        // lazy load the user-list element and any of its dependencies
        import("./user-list");

        // the element created or activated when the route becomes active
        const element = event.detail.element;

        // the EventTarget that triggered the route (if exists)
        const sourceElement = event.detail.sourceElement;

        // stops route from appending the element to the DOM
        // so custom behaviors such as animation can be applied
        event.preventDefault(); 
    }

    usersRouteInActive(event) {
        // the element and sourceElement are the same as when the route is activated.
        const { element, sourceElement } = event.detail;

        // keeps the route from removing the element from the DOM
        event.preventDefault();
    }
}
```


## Router
The `Router` has static methods that can be useful for navigation and for setting a root path for all routes.
- **Router.pushUrl(url)** - uses `history.pushState` to add the URL to the browser history and trigger route matching.
- **Router.replaceUrl(url)** - uses `history.replaceState` to replace the URL in the browser history and trigger route matching.
- **Router.replaceUrlParams(params)** - replaces the current query parameters in the URL and triggers route matching.
- **Router.root** - set the root path for all routes; this can only be set once and should start with a backslash, e.g. `Router.root = "/demo";`


## Public API
### Attributes
- **pattern** - the route pattern to match.
- **element** - the element to create when the route matches
- **append-to** - where the element should be appended to when the route matches; can be "body", "parent" (the default), or a DOM query selector.

### Properties
- **parentRoute** - a parent route object used for subrouting.
- **tail** - read only route tail.

### Methods
- **navigate(options)** - navigates to the route.

### Events
- **route-active** - triggered when the route pattern matches.
- **route-inactive** - triggered when the route pattern no longer matches.


## TypeScript Interfaces
Here are a few TypeScript interfaces that may be helpful when developing in TypeScript.
```ts
/** Contains the parsed route segments */
interface RouteParams extends StringIndex<string|null> {}

/** Parsed query parameters */
interface QueryParams extends StringIndex<string> {}

/** Used for parent and tail routes */
interface Route {
    prefix: string,
    path: string,
    routeParams: RouteParams
}

/** Options when calling the route.navigate(options) method */
interface NavigateOptions {
    replaceState?: boolean,
    routeParams?: RouteParams,
    queryParams?: QueryParams
}
```

## Redux Dev Tools
The router does not use `Redux` but it can be configured to send events/actions to the Redux Dev Tools for visualizing
the current state of the routes in the DOM as well as using time travel.

This is because the `DomxRoute` element uses the [DataElement](https://github.com/domxjs/domx/tree/master/packages/DataElement)
package from Domx which exposes middleware to do this.

If you are using Data Elements then it is recommended that you import and apply the middleware from that package, however,
it is also included here for convenience.

```js
import { applyDataElementRdtLogging } from "@domx/router/middleware";

applyDataElementRdtLogging(/*options*/);
```
