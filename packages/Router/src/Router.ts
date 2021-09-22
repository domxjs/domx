import { RootState } from "@domx/dataelement/RootState";
import { DomxRouteData } from "./DomxRouteData";
import { routeMatches, getRouteMatch } from "./routeMatcher";
export {
    Router,
    Route,
    RouteParams,
    RouteInfo,
    RouteLocation,
    LocationChangedDetail,
    RouteState,
    QueryParams,
    RouteMatch
}


/** Used for parent and tail routes */
interface Route {
    prefix: string,
    path: string,
    routeParams: RouteParams
}

interface StringIndex<T> {
    [key:string]:T
}

/** Contains the parsed route segments */
interface RouteParams extends StringIndex<string|null> {}

/** Parsed URL by DomxLocation */
interface RouteLocation {
    root: string,
    url:string,
    /** do I need the pathname here? yes separates the pahtname from query params */
    pathname: string,
    queryParams: QueryParams
}

/** DomxRouteData element state property */
interface RouteState {
    routeId:string,
    url: string,
    parentRoute:Route|null,
    matches: boolean,
    tail:Route|null,
    routeParams:RouteParams,
    queryParams:QueryParams
}

/** Route information passed from DomxRoute to DomxRouteData */
interface RouteInfo {
    pattern:string,
    element:string,
    appendTo: string
}

/** Parsed query parameters */
interface QueryParams extends StringIndex<string> {}

interface LocationChangedDetail {
    sourceElement?: EventTarget|null,
    pushState?: boolean,
    replaceState?: boolean,
    popState?: boolean,
    pageLoad?: boolean
}

interface RouteMatch {
    matches:boolean,
    routeParams:RouteParams,
    tail:Route|null
}
  

/** Used for testing routes against body@click */
const routes:StringIndex<DomxRouteData> = {};


/**
 * A class that contains static methods for updating the url
 * and triggering routes.
 */
class Router {
    private static _isInitialized = false;

    private static _root = "/";
    static get root():string { return Router._root; }
    static set root(root:string) {
        if (Router._root === "/") {
            Router._root = root;
        } else {
            throw new Error("Router.root has already been set.");
        }
    }

    /**
     * Initializes the router; called by DomxLocation.
     */
    static init():void {
        if (Router._isInitialized) {
            return;
        }
        triggerLocationChanged({pageLoad: true});
        Router._isInitialized = true;
    }

    static addRoute(routeData:DomxRouteData) {
        if (!routeData.pattern) {
            throw new Error("Router: cannot add a route without a pattern")
        }
        
        if (routeData.routeId === null) {
            routeData.routeId = getNextRouteId(routeData.pattern);
        }

        routes[routeData.routeId] = routeData;
    }

    static removeRoute(routeData:DomxRouteData) {
        delete routes[routeData.routeId as string];
    }

    static matchRoute(route:DomxRouteData, url:string):RouteMatch {
        return getRouteMatch(getPathFromRoute(route), url);
    }

    /**
     * Uses history.pushState to push a URL on the history stack.
     * @param url {string} the absolute URL path to push.
     */
    static pushUrl(url:string, detail:LocationChangedDetail = {}) {
        window.history.pushState({}, "", url);
        triggerLocationChanged({...detail, pushState: true});
    }

    /**
     * Uses history.replaceState to replace the current URL.
     * Useful for inner page navigation such as tabs.
     * @param url {String} the absolute URL path used to replace the current one.
     */
    static replaceUrl(url:string, detail:LocationChangedDetail = {}) {
        window.history.replaceState(history.state, "", url);
        triggerLocationChanged({...detail, replaceState: true});
    }

    /**
     * Sets/removes the query parameters on the current
     * URL using replaceState if the new URL to set is
     * different than the current URL.
     * @param params {StringIndex<string>}
     */
    static replaceUrlParams(params:StringIndex<string>) {
        const currentUrl = new URL(window.location.href);
        const newUrl = new URL(window.location.href);

        Object.keys(params).forEach(key => {
            const value = params[key];
            value ? newUrl.searchParams.set(key, params[key]) :
            newUrl.searchParams.delete(key);
        });

        urlsAreEqual(newUrl, currentUrl) || Router.replaceUrl(newUrl.href);
    }

    /** Used for tests */
    static _reset() {
        Router._root = "/";
        Router._isInitialized = false;
    }
}

/** Handles link navigation */
const routerOnBodyClick = (event:MouseEvent) => {

    // test if this is a standard click
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey) {
        return;
    }
  
    // test if this is a valid anchor
    const anchor = (event.composedPath().filter((n:EventTarget) =>
        (n as HTMLElement).tagName === "A")[0] as HTMLAnchorElement);    
    if (!anchor || anchor.target ||
        anchor.hasAttribute('download') ||
        anchor.getAttribute('rel') === 'external') {
        return;
    }
  
    // don't handle mailto
    const href = anchor.href;
    if (!href || href.indexOf('mailto:') !== -1) {
        return;
    }

    // don't handle outside origin
    const location = window.location;
    const origin = location.origin || location.protocol + '//' + location.host;
    if (href.indexOf(origin) !== 0) {
        return;
    }
  
    // see if a route matches the URL
    const url = `${anchor.pathname}${anchor.search}`;
    if (!routesMatch(url)) {
        console.debug(`Router: no routes match \"${url}\"`);
        return;
    }
  
    // handle the url
    event.preventDefault();
    const sourceElement = anchor;    
    sourceElement instanceof HTMLElement && sourceElement.hasAttribute("replace-state") ?
        Router.replaceUrl(url, { sourceElement }) :
        Router.pushUrl(url, { sourceElement});
};

document.body.addEventListener("click", routerOnBodyClick);


/** Handles browser back button navigation */
const routerOnPopState = () => {
    triggerLocationChanged({
        popState: true
    });
};

window.addEventListener("popstate", routerOnPopState);


/** Returns true when finding the first route that matches */
const routesMatch = (url:string) =>
   Object.keys(routes).find(key => 
        routeMatchesUrl(routes[key], url)) ?
        true : false;

const triggerLocationChanged = (detail:LocationChangedDetail) => {
    window.dispatchEvent(new CustomEvent("location-changed", {
        detail
    }));
    setTimeout(() => RootState.snapshot("window@location-changed"), 0);
};

/** Used for tracking registered routes */
let nextRouteId = 1;
const getNextRouteId = (pattern:string):string => {
    const routeId = `${nextRouteId}:${pattern}`;
    nextRouteId = nextRouteId + 1;
    return routeId;
};


/**
 * Compares two urls to identify if the paths,
 * number of params, and params all match.
 * @param {URL} url1
 * @param {URL} url2
 * @returns Boolean
 */
 const urlsAreEqual = (url1:URL, url2:URL):boolean => {
    const searchParams1 = url1.searchParams;
    const searchParams2 = url2.searchParams;
  
    // Same number of params?
    if ([...searchParams1].length !== [...searchParams2].length) {
        return false;
    }
  
    const paramsMatch = Array.from(searchParams1.keys()).find(key =>
        searchParams1.get(key) !== searchParams2.get(key)) ? false : true;
    return paramsMatch;
};

const getPathFromRoute = (route:DomxRouteData):string => {
    const path = `${route.parentRoute?.prefix || ""}${route.pattern}`;
    return path;
};

const routeMatchesUrl = (route:DomxRouteData, url:string):boolean => {
    const matches = routeMatches(getPathFromRoute(route), url);
    return matches;
};

