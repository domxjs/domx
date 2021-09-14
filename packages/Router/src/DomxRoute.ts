import { LitElement, html } from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import { QueryParams, Route, RouteParams } from "./Router";
export { DomxRoute, NavigateOptions }


interface NavigateOptions {
    replaceState:boolean,
    routeData?: RouteParams,
    queryParams?:QueryParams
}


@customElement("domx-route")
class DomxRoute extends LitElement {

    @property({attribute:false}) 
    parentRoute:Route|null = null;

    @property({attribute:false})
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

    navigate({replaceState, routeData, queryParams}:NavigateOptions = {replaceState:false}) {
        if (!this.parentRoute) {
            // pushState using "/" + pattern
        } else {
            // pushState using parentRoute prefix + pattern
        }
    }

    cachedElements = {}; // key is stringified routedata, value is element

    //@ts-ignore - remove
    isActive: false;
    activeElement:HTMLElement|null = null;
    activeRouteData:RouteParams|null = null;
    activeSourceElement:HTMLElement|null = null;
    lastSourceElement:HTMLElement|null = null;

    @query("domx-route-data")
    $routeData = null;

    @query("domx-location")
    $location = null;

    connectedCallback() {
        // if there is a route-from, set that as the parentRoute
        // use this.getRootNode().querySelector(this.rootFrom)
    }

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
                @location-changed="${this.locationChanged}"
            ></domx-location>
        `;
    }

    locationChanged(event:Event) {
        //@ts-ignore - remove
        this.lastSourceElement = $location.sourceElement;
        //@ts-ignore - remove
        $routeData.location = $location.location;
    }

    routeStateChanged() {
        // if active is changing from false to true (or if active and routeData has changed or
        //     if route tail has changed)
        // see if element already exists if so jump to trigger
        // if not create the element
        //    remove an element from cache if needed
        //    add the each routeData as attributes        
        //    add queryParams as a property
        //    update the activeRouteData, activeElement, and activeSourceElement
        //    add element to cache if needed
        // trigger route-active with element and sourceElement
        //    add the parentRoute as a property (use route tail)
        //    if not event.preventDefault called then
        //    append to the DOM according to append-to

        // if active is changing from true to false
        // trigger route-inactive with element and sourceElement
        //    if not event.preventDefault
        //    remove from the DOM and add to cache if needed
    }
}
