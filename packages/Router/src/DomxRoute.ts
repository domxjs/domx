import { LitElement, html, css } from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import { QueryParams, Route, RouteParams, RouteState } from "./Router";
import { Logger } from "@domx/middleware/Logger";
import { DomxLocation } from "./DomxLocation";
import { DomxRouteData } from "./DomxRouteData";
import { Router } from ".";
// import again since DomxLocation is included for types
import "./DomxLocation"; 
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

interface CachedElement {
    element:HTMLElement,
    routeParams:RouteParams,
    queryParams:QueryParams,
    parentRoute:Route|null
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

    @property({type:Boolean})
    cache:boolean = false;

    @property({type:Number, attribute:"cache-count"})
    cacheCount:number = 10;

    /**
     * Navigates to this route.
     * Must supply all routeParams including parent
     * routeParams if a subroute.
     * @param options {NavigationOptions}
     */
    navigate(options:NavigateOptions = {replaceState:false}) {
        navigate(this as DomxRoute, options)
    }

    cachedElements:{[key:string]:CachedElement} = {};
    activeElement:CachedElement|null = null;    
    activeSourceElement:EventTarget|null|undefined = null;
    lastSourceElement:EventTarget|null|undefined = undefined;

    @query("domx-route-data")
    $routeData!:DomxRouteData;

    @query("domx-location")
    $location!:DomxLocation;

    routeState:RouteState = DomxRouteData.defaultState;

    connectedCallback() {
        super.connectedCallback();
        this.findParent();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        hideElement(this);
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

    /**
     * Checks to see if the parent element is a DomxRoute
     * and associates its tail with this parentRoute.
     */
    private async findParent() {
        const parentEl = this.parentElement;
        if (parentEl && parentEl instanceof DomxRoute) {
            await this.updateComplete;
            this._removeTailListener && this._removeTailListener();
            this._addTailListener(parentEl);
        }
    }

    private _tailListener:EventListener|null = null;
    private _removeTailListener:Function|null = null;
    private _addTailListener(parentElement:DomxRoute) {
        const el = this;
        const updateParent = () => {
            const { tail } = parentElement;
            el.parentRoute = tail;
            Logger.log(this, "debug", `DomxRoute: set parentRoute: ${el.element} ` +
                `${tail ? `prefix: ${tail.prefix}, path: ${tail.path}` : `null`}`);
        };
        parentElement.addEventListener("tail-changed", updateParent);
        this._tailListener = updateParent;
        updateParent();
        this._removeTailListener = () => {
            el._tailListener = null;
            parentElement.removeEventListener("tail-changed", updateParent);
        }
    }

    private routeStateChanged() {
        const routeState = this.$routeData.state;
        if (!routeState) {
            return;
        }
        this.tail = routeState.tail;
        showHideElement(this, routeState);
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

    private _isDefaultPrevented = false;
    get isDefaultPrevented() { return this._isDefaultPrevented }

    preventDefault() {
        this._isDefaultPrevented = true;
    }
}


const hasChanged = (obj1:any, obj2:any) => 
    JSON.stringify(obj1) !== JSON.stringify(obj2);


const setElementProperties = (el:any, properties:any) => {
    Object.keys(properties).map(prop => {
        el[prop] = properties[prop];
    });
};


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
    if (routeParams) {
        Object.keys(routeParams as object).forEach(name => {
            path = path.replace(`:${name}`, routeParams[name] as string);
        });
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


const showHideElement = (routeEl:DomxRoute, routeState:RouteState) => {   
    const ae = routeEl.activeElement;
    if ((!ae && routeState.matches) ||
        (ae && routeState.matches && (
            hasChanged(ae.routeParams, routeState.routeParams) ||
            hasChanged(ae.parentRoute, routeState.tail) ||
            hasChanged(ae.queryParams, routeState.queryParams)
        ))
    ){
        // get/create the element
        const el = ae ? ae.element :
            document.createElement(routeEl.element || "div");
        
        Logger.log(routeEl, "debug", `DomxRoute: ${routeEl.activeElement ?
            "appending cached element" : "appending new element"}`, el.tagName);

        // set each route parameter as an attribute
        Object.keys(routeState.routeParams).map(name => {
            const val = routeState.routeParams[name];
            val ? el.setAttribute(name, val!) : el.removeAttribute(name);
        });

        // set queryParams and parentRoute as properties
        setElementProperties(el, {
            queryParams: routeState.queryParams,
            parentRoute: routeState.tail
        });

        // record activeElement
        routeEl.activeElement = {
            element: el,
            routeParams: routeState.routeParams,
            queryParams: routeState.queryParams,
            parentRoute: routeState.tail
        };
        routeEl.activeSourceElement = routeEl.lastSourceElement;

        // dispatch the active event
        const routeActiveEvent = new RouteActiveChangedEvent(
            RouteActiveChangedEventType.Active, el, routeEl.activeSourceElement);
        routeEl.dispatchEvent(routeActiveEvent);
        if (routeActiveEvent.isDefaultPrevented) {
            return;
        }

        // append to the DOM
        let root = routeEl.getRootNode();
        root = root === document ? document.body : root;
        if (routeEl.appendTo === "parent") {            
            root.appendChild(el);
        } else if(routeEl.appendTo === "body") {
            document.body.appendChild(el);                
        } else {
            (<Element>root).querySelector(routeEl.appendTo)?.appendChild(el);
        }


    } else if (ae &&  routeState.matches === false) {
        hideElement(routeEl);
    }
};


const hideElement = (routeEl:DomxRoute) => {
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

    if (routeActiveEvent.isDefaultPrevented) {
        return;
    }

    // remove from DOM
    el.remove();
    Logger.log(routeEl, "debug", "DomxRoute: removed element", el.tagName);
};