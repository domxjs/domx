import { DomxRouteData } from "./DomxRouteData";
export {
    Router,
    Route,
    RouteData,
    RouteInfo,
    RouteLocation,
    LocationChangedDetail,
    RouteState,
    QueryParams
}


/** Used for parent and tail routes */
interface Route {
    prefix: string,
    path: string
}

interface StringIndex<T> {
    [key:string]:T
}

/** Contains the parsed route segments */
interface RouteData extends StringIndex<string|null> {}

/** Parsed URL by DomxLocation */
interface RouteLocation {
    url:string,
    /** do I need the pathname here? yes separates the pahtname from query params */
    pathname: string,
    queryParams: QueryParams
}

/** DomxRouteData element state property */
interface RouteState {
    routeId:string,
    url: string,
    matches: boolean,
    tail:Route,
    routeData:RouteData,
    queryParams:QueryParams
}

/** Route information passed from DomxRoute to DomxRouteData */
interface RouteInfo {
    parentRoute:Route,
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
    pageLoad?: boolean
}
  

/** Used for testing root routes against body@click */
const routes:StringIndex<DomxRouteData> = {};


/**
 * A class that contains static methods for updating the url
 * and triggering routes.
 */
class Router {
    private static _isInitialized = false;

    static init() {
        if (Router._isInitialized) {
            return;
        }

        const url = `${window.location.pathname}${window.location.search}`;
        if (routeMatches(url)) {
            triggerLocationChanged({pageLoad: true});
        }

        Router._isInitialized = true;
    }

    static addRoute(routeData:DomxRouteData) {
        if (routeData.pattern === null) {
            throw new Error("Router: cannot addRout without a pattern")
        }
        routeData.routeId = getNextRouteId(routeData.pattern);
        routes[routeData.routeId] = routeData;
    }

    static removeRoute(routeData:DomxRouteData) {
        delete routes[routeData.routeId as string];
    }

    /**
     * Uses history.pushState to push a URL on the history stack.
     * @param url {string} the absolute URL path to push.
     */
    static pushUrl(url:string) {
        window.history.pushState({}, "", url);
        triggerLocationChanged({pushState: true});
    }

    /**
     * Uses history.replaceState to replace the current URL.
     * Useful for inner page navigation such as tabs.
     * @param url {String} the absolute URL path used to replace the current one.
     */
    static replaceUrl(url:string) {
        window.history.replaceState(history.state, "", url);
        triggerLocationChanged({replaceState: true});
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
}


document.body.addEventListener("click", event => {

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
  
    // see if a registered root route matches the URL
    const url = `${anchor.pathname}${anchor.search}`;
    if (!routeMatches(url)) {
        return;
    }
  
    // handle the url
    event.preventDefault();
    Router.pushUrl(url);
    triggerLocationChanged({
        sourceElement: event.target
    });
});


const routeMatches = (url:string) =>
   Object.keys(routes).find(key => 
        routes[key].parentRoute !== null && routes[key].matches(url)) ?
        true : false;

const triggerLocationChanged = (detail:LocationChangedDetail) => {
    window.dispatchEvent(new CustomEvent("location-changed", {
        detail
    }));
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
    // Does the path match
    if (url1.origin + url1.pathname !== url2.origin + url2.pathname) {
        return false;
    }
  
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
  

