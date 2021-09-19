import { LitElement, html, css } from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import { LocationChangedDetail, QueryParams, Route, RouteLocation, RouteParams, RouteState } from "./Router";
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
    navigate({replaceState, routeParams, queryParams}:NavigateOptions = {replaceState:false}) {

        let path = "";
        let el = this as HTMLElement;
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
        path = `${path}${this.pattern}`;

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

    locationChanged(event:Event) {
        this.lastSourceElement = DomxLocation.lastSourceElement;
        this.$routeData.location = this.$location.location;
    }

    /**
     * Checks to see if the parent element is a DomxRoute
     * and associates its tail with this parentRoute.
     */
    async findParent() {
        const parentEl = this.parentElement;
        if (parentEl && parentEl instanceof DomxRoute) {
            await this.updateComplete;
            this._removeTailListener && this._removeTailListener();
            this._addTailListener(parentEl);
        }
    }

    _tailListener:EventListener|null = null;
    _removeTailListener:Function|null = null;
    _addTailListener(parentElement:DomxRoute) {
        const el = this;
        const updateParent = () => {
            el.parentRoute = parentElement.tail;
            console.debug("DomxRoute - findParent, setting parentRoute from tail:", el.tagName, parentElement.tail);
        };
        parentElement.addEventListener("tail-changed", updateParent);
        this._tailListener = updateParent;
        updateParent();
        this._removeTailListener = () => {
            parentElement.removeEventListener("tail-changed", updateParent);
            console.debug("DomxRoute - findParent, REMOVING listener");
        }
    }

    routeStateChanged() {
        const routeState = this.$routeData.state;
        if (!routeState) {
            return;
        }
        this.tail = routeState.tail;
        const ae = this.activeElement;
        if ((!ae && routeState.matches) ||
            (ae && routeState.matches && (
                hasChanged(ae.routeParams, routeState.routeParams) ||
                hasChanged(ae.parentRoute, routeState.tail) ||
                hasChanged(ae.queryParams, routeState.queryParams)
            ))
        ){
            // get/create the element
            const el = ae ? ae.element :
                document.createElement(this.element || "div");
            

            console.debug(`DomxRoute - ${this.activeElement ?
                "Have Active Element" : "Create Element"}`, el.tagName);

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
            this.activeElement = {
                element: el,
                routeParams: routeState.routeParams,
                queryParams: routeState.queryParams,
                parentRoute: routeState.tail
            };
            this.activeSourceElement = this.lastSourceElement;

            // dispatch the active event
            const routeActiveEvent = new RouteActiveChangedEvent(
                RouteActiveChangedEventType.Active, el, this.activeSourceElement);
            this.dispatchEvent(routeActiveEvent);
            if (routeActiveEvent.isDefaultPrevented) {
                return;
            }

            // append to the DOM
            if (this.appendTo === "parent") {
                this.getRootNode().appendChild(el);
            } else if(this.appendTo === "body") {
                document.body.appendChild(el);                
            } else {
                (<Element>this.getRootNode()).querySelector(this.appendTo)?.appendChild(el);
            }


        } else if (ae &&  routeState.matches === false) {
            const el = ae.element;
            
            // dispatch inactive event
            const routeActiveEvent = new RouteActiveChangedEvent(
                RouteActiveChangedEventType.Inactive, el, this.activeSourceElement);
            
            this.dispatchEvent(routeActiveEvent);            
            this.activeElement = null;
            this.activeSourceElement = null;

            if (routeActiveEvent.isDefaultPrevented) {
                return;
            }

            // remove from DOM
            el.remove();
            console.debug("DomxRoute - removed element", el.tagName);      
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
