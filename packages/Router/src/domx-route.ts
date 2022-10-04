import { LitElement, html, css } from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import { QueryParams, Route, RouteParams, RouteState } from "./Router";
import { Logger } from "@domx/middleware/Logger";
import { DomxLocation } from "./domx-location";
import { DomxRouteData } from "./domx-route-data";
import { Router } from ".";
import { monitorParentRoute, appendElement } from "./domxRoute";
// import again since DomxLocation is included for types
import "./domx-location"; 
export {
    DomxRoute,
    NavigateOptions,
    RouteActiveChangedEvent,
    RouteActiveChangedEventType
}

interface NavigateOptions {
    replaceState?:boolean,
    routeParams?: RouteParams,
    queryParams?:QueryParams
}

@customElement("domx-route")
class DomxRoute extends LitElement {

    @property({attribute:false})  
    parentRoute:Route|null = null;

    //@property({attribute:false})
    get tail():Route|null { return this._tail; };
    private set tail(tail:Route|null) {
        this._tail = tail;
        this.dispatchEvent(new CustomEvent("tail-changed"));
    }
    _tail:Route|null = null;

    @property({type:String})
    pattern:string = "";

    @property({type:String})
    element:string|null = null;

    @property({attribute: "append-to"})
    appendTo:string = "parent"; // parent, body, or shadow query

    @property({type:Number, attribute:"cache-count"})
    get cacheCount():number { return this._cacheCount; }
    set cacheCount(value) { this._cacheCount = value < 1 ? 1 : value; }
    _cacheCount = 1;

    /**
     * Navigates to this route.
     * Must supply all routeParams including parent
     * routeParams if a subroute.
     * @param options {NavigationOptions}
     */
    navigate(options:NavigateOptions = {replaceState:false}) {
        navigate(this as DomxRoute, options)
    }

    cachedElements:Array<CachedRouteElement> = [];
    activeElement:CachedRouteElement|null = null;    
    activeSourceElement:EventTarget|null|undefined = null;
    lastSourceElement:EventTarget|null|undefined = undefined;

    @query("domx-route-data")
    $routeData!:DomxRouteData;

    @query("domx-location")
    $location!:DomxLocation;

    routeState:RouteState = DomxRouteData.defaultState;

    private _removeParentMonitor:Function|null = null;

    async connectedCallback() {
        super.connectedCallback();
        this._removeParentMonitor = monitorParentRoute(this, this._removeParentMonitor);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeParentMonitor?.();
        removeActiveElement(this);
    }

    static styles = css`:host { display:none }`;

    render() {
        return html`
            <domx-route-data
                .parentRoute="${this.parentRoute}"
                .pattern="${this.pattern}"
                .element="${this.element}"
                .appendTo="${this.appendTo}"
                @state-changed="${this.routeStateChanged}"
            ></domx-route-data>
            <domx-location
                @state-changed="${this.locationChanged}"
            ></domx-location>
        `;
    }

    private locationChanged(event:Event) {
        this.lastSourceElement = DomxLocation.lastSourceElement;
        this.$routeData.location = this.$location.location;
    }

    private routeStateChanged() {
        const routeState = this.$routeData.state;
        this.routeState = routeState;
        if (routeState) {
            this.tail = routeState.tail;
            updateActiveElement(this, routeState);
        }        
    }
}

enum RouteActiveChangedEventType {
    Active = "active",
    Inactive = "inactive"
}

class RouteActiveChangedEvent extends CustomEvent<any> {
    constructor(type: RouteActiveChangedEventType, element:HTMLElement, sourceElement:EventTarget|null|undefined) {
        super(`route-${type}`, {
            detail: {
                element,
                sourceElement
            }
        });
    }

    private _defaultPrevented = false;
    get defaultPrevented() { return this._defaultPrevented }

    preventDefault() {
        this._defaultPrevented = true;
    }
}


const navigate = (routeEl:DomxRoute, options:NavigateOptions)  => {

    const {replaceState, routeParams, queryParams} = options;
    let path = "";
    let el = routeEl as HTMLElement;


    // need to walk parent elements patterns, prepending and removing
    // splats until no parent; then prepend the parentRoute.prefix
    while(el.parentElement) {
        if (el.parentElement instanceof DomxRoute) {
            let pattern = el.parentElement.pattern;
            // remove splat
            const splatIndex = pattern.indexOf("/*");
            if (splatIndex > 0) {
                pattern = pattern.substring(0, splatIndex);
            }
            path = `${pattern}${path}`;
        }
        el = el.parentElement;
    }
    if (el instanceof DomxRoute && el.parentRoute) {
        path = `${el.parentRoute.prefix}${path}`;
    }
      
    path = `${path}${routeEl.pattern}`;

    // remove parens
    path = path.replace(/\(/g, "").replace(/\)/g, "");

    // add routeParams
    if (routeEl.parentRoute) {
        path = replaceRouteParams(routeEl.parentRoute.routeParams, path);
    }
    if (routeParams) {
        path = replaceRouteParams(routeParams, path);
    }

    if (path.indexOf(":") > -1) {
        throw new Error(`DomxRoute: cannot navigate; all routeParams were not provided: "${path}"`);
    }

    // add queryParams
    if (queryParams) {
        const sp = new URLSearchParams();
        Object.keys(queryParams).forEach(name => {
            sp.set(name, queryParams[name]);
        });
        path = `${path}?${sp.toString()}`;
    }

    replaceState === true ?
        Router.replaceUrl(path) :
        Router.pushUrl(path);
};

const replaceRouteParams = (routeParams:RouteParams, path:string):string => {
    Object.keys(routeParams as object).forEach(name => {
        path = path.replace(`:${name}`, routeParams[name] as string);
    });    
    return path;
};



class CachedRouteElement {
    constructor(element:HTMLElement, routeState:RouteState) {
        this.element = element;
        this.routeState = routeState;
    }

    /** shallow compares routeParams */
    matches(routeState:RouteState):boolean {
        const obj1 = routeState.routeParams;
        const obj2 = this.routeState.routeParams;
        return Object.keys(obj1).length === Object.keys(obj2).length &&
            Object.keys(obj1).every(key => 
                obj2.hasOwnProperty(key) && obj1[key] === obj2[key]);
    }

    element:HTMLElement;
    routeState:RouteState;
}



const updateActiveElement = (routeEl:DomxRoute, routeState:RouteState) => { 
    const ae = routeEl.activeElement;
    const matchesCurrent = routeState.matches;

    if (!ae && matchesCurrent) {
        activateElementInCacheOrCreate(routeEl, routeState);

    } else if (ae && matchesCurrent) {

        // only update the queryParams if base url matches
        if (ae.matches(routeState)) {
            setElementProperties(ae.element, {
                queryParams: routeState.queryParams
            });
            addRouteParamAttributes(ae.element, routeState.routeTailParam);

        // cache active element and get/create new one
        } else {
            removeActiveElement(routeEl);
            activateElementInCacheOrCreate(routeEl, routeState);

        }        
    } else if (ae && !matchesCurrent) {
        removeActiveElement(routeEl);
    }
};


const activateElementInCacheOrCreate = (routeEl:DomxRoute, routeState:RouteState) => {
    let ae:CachedRouteElement;

    // use element if in cache
    const cachedIndex = routeEl.cachedElements.findIndex(ce => ce.matches(routeState));
    if (cachedIndex > -1) {
        // remove and return the cached item
        ae = routeEl.cachedElements.splice(cachedIndex, 1)[0];
        
        // update the query params
        setElementProperties(ae.element, {
            queryParams: routeState.queryParams
        });

    } else {

        // create the element
        const el = document.createElement(routeEl.element || "div");

        // add routeParams as attributes
        if (routeEl.parentRoute) {
            addRouteParamAttributes(el, routeEl.parentRoute.routeParams);
        }
        addRouteParamAttributes(el, routeState.routeParams);
        addRouteParamAttributes(el, routeState.routeTailParam);

        // set queryParams and parentRoute as properties
        setElementProperties(el, {
            queryParams: routeState.queryParams,
            parentRoute: routeState.tail
        });

        // record activeElement
        ae = new CachedRouteElement(el, routeState);
    }

    routeEl.activeElement = ae;
    appendAndCacheActiveElement(routeEl);
};


/** Adds route params as attributes to the HTML element */
const addRouteParamAttributes = (el:HTMLElement, routeParams:RouteParams) => {
    Object.keys(routeParams).map(name => {
        const val = routeParams[name];
        val ? el.setAttribute(name, val!) : el.removeAttribute(name);
    });
};

/** Sets properties on the element. */
 const setElementProperties = (el:any, properties:any) => {
    Object.keys(properties).map(prop => {
        el[prop] = properties[prop];
    });
};



/**
 * Dispatches the route active event and appends
 * the element to the DOM
 */
const appendAndCacheActiveElement = (routeEl: DomxRoute) => {
    const ae = routeEl.activeElement!;

    // add to top of cache and remove last item if needed
    routeEl.cachedElements.unshift(ae);
    if (routeEl.cacheCount < routeEl.cachedElements.length) {
        routeEl.cachedElements.pop();
    }

    // dispatch the active event
    const el = ae.element;
    Logger.log(routeEl, "debug", "DomxRoute: appending element:", el.tagName);
    routeEl.activeSourceElement = routeEl.lastSourceElement;
    const routeActiveEvent = new RouteActiveChangedEvent(
        RouteActiveChangedEventType.Active, el, routeEl.activeSourceElement);
    routeEl.dispatchEvent(routeActiveEvent);
    if (routeActiveEvent.defaultPrevented) {
        return;
    }

    // append to the DOM
    appendElement(routeEl, el);
};



/**
 * Dispatches the route inactive event 
 * and removes the element from the DOM.
 */
const removeActiveElement = (routeEl:DomxRoute) => {
    const ae = routeEl.activeElement;
    if (!ae) {
        return;
    }

    const el = ae.element;
        
    // dispatch inactive event
    const routeActiveEvent = new RouteActiveChangedEvent(
        RouteActiveChangedEventType.Inactive, el, routeEl.activeSourceElement);
    
    routeEl.dispatchEvent(routeActiveEvent);            
    routeEl.activeElement = null;
    routeEl.activeSourceElement = null;

    if (routeActiveEvent.defaultPrevented) {
        return;
    }

    // remove from DOM
    el.remove();
    Logger.log(routeEl, "debug", "DomxRoute: removed element", el.tagName);
};