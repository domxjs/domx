import { LitElement, html, css } from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import { QueryParams, Route, RouteLocation, RouteParams, RouteState } from "./Router";
import { DomxLocation } from "./DomxLocation";
import { DomxRouteData } from "./DomxRouteData";
import { Router } from ".";
// import again since DomxLocation is included for types
import "./DomxLocation"; 
export { DomxRoute, NavigateOptions }



interface NavigateOptions {
    replaceState:boolean,
    routeParams?: RouteParams,
    queryParams?:QueryParams
}

@customElement("domx-route")
class DomxRoute extends LitElement {

    @property({attribute:false}) 
    
    parentRoute:Route|null = null;

    //@property({attribute:false})
    get tail():Route|null { return this._tail; };
    _tail:Route|null = null;

    @property({type:String})
    pattern:string = "";

    @property({type:String})
    element:string|null = null;

    @property({attribute: "append-to"})
    appendTo:string = "parent"; // parent, body, or shadow query

    // this is used to declaratively set the parent route
    @property({attribute: "route-from"})
    routeFrom:string|null = null;

    @property({type:Boolean})
    cache:boolean = false;

    @property({type:Number, attribute:"cache-count"})
    cacheCount:number = 10;

    navigate({replaceState, routeParams, queryParams}:NavigateOptions = {replaceState:false}) {

        let path = this.pattern;

        if (routeParams !== undefined) {
            Object.keys(routeParams as object).forEach(name => {
                path = path.replace(`:${name}`, routeParams[name] as string);
            });
        }

        if (queryParams) {
            const sp = new URLSearchParams();
            Object.keys(queryParams).forEach(name => {
                sp.set(name, queryParams[name]);
            });
            path = `${path}?${sp.toString()}`;
        }

        if (this.parentRoute) {
            path = `${this.parentRoute.prefix}${path}`;
        }

        replaceState === true ?
            Router.replaceUrl(path) :
            Router.pushUrl(path);
    }

    cachedElements = {}; // key is stringified routedata, value is element

 
    isActive = false;
    activeElement:HTMLElement|null = null;
    activeRouteParams:RouteParams|null = null;
    activeTail:Route|null = null;
    activeSourceElement:EventTarget|null|undefined = null;
    lastSourceElement:EventTarget|null|undefined = undefined;

    @query("domx-route-data")
    $routeData!:DomxRouteData;

    @query("domx-location")
    $location!:DomxLocation;

    routeState:RouteState = DomxRouteData.defaultState;

    connectedCallback() {
        super.connectedCallback();
        this.handleRouteFrom();
    }

    static styles = css`:host { display:none }`;

    render() {
        return html`
        DOMX-ROUTE
            <domx-route-data
                .parentRoute="${this.parentRoute}"
                .pattern="${this.pattern}"
                .element="${this.element}"
                .appendTo="${this.appendTo}"
                @state-changed="${this.routeStateChanged}"
            ></domx-route-data>
            <domx-location
                @location-changed="${this.locationChanged}"
            ></domx-location>
        `;
    }

    locationChanged(event:Event) {
        this.lastSourceElement = this.$location.locationChangedDetail.sourceElement;
        this.$routeData.location = this.$location.location;
    }

    handleRouteFrom() {
        if (this.routeFrom) {
            const parentRouteEl = (<Element>this.getRootNode()).querySelector(this.routeFrom) as DomxRoute;
            this.parentRoute = parentRouteEl.tail;
        }       
    }

    routeStateChanged() {
        const routeState = this.$routeData.state;

        if ((this.isActive === false && routeState.matches) ||
            (this.isActive && routeState.matches && (
                hasChanged(this.activeRouteParams, routeState.routeParams) ||
                hasChanged(this.activeTail, routeState.tail)
            ))
        ){
            // get/create the element
            const el = (this.isActive && this.activeElement) ? this.activeElement :
                document.createElement(this.element as string);
            

            console.debug(`DomxRoute - ${this.activeElement ?
                "Have Active Element" : "Create Element"}`, el.tagName);
   
            
            // set each route parameter as an attribute
            Object.keys(routeState.routeParams).map(name => {
                routeState.routeParams[name] && el.setAttribute(name, routeState.routeParams[name]!);
            });

            // set queryParams and parentRoute as properties
            setElementProperties(el, {
                queryParams: routeState.queryParams,
                parentRoute: routeState.tail
            });

            // record activeElement
            this.isActive = true;
            this.activeElement = el;
            this.activeRouteParams = routeState.routeParams;
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


        } else if (this.isActive && routeState.matches === false) {
            const el = this.activeElement as HTMLElement;
            
            // dispatch inactive event
            const routeActiveEvent = new RouteActiveChangedEvent(
                RouteActiveChangedEventType.Inactive, el, this.activeSourceElement);
            
            this.dispatchEvent(routeActiveEvent);
            
            this.isActive = false;
            this.activeElement = null;
            this.activeRouteParams = null;
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
