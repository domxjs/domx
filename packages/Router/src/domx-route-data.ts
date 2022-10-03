import { DataElement } from "@domx/dataelement";
import { customDataElement, dataProperty } from "@domx/dataelement/decorators";
import { Router, Route, RouteLocation, RouteState, RouteInfo } from "./Router";
export { DomxRouteData }

@customDataElement("domx-route-data", {stateIdProperty: "routeId"})
class DomxRouteData extends DataElement {
    static defaultState:RouteState = {
        routeId: "",
        url: "",
        parentRoute: null,
        matches: false,
        routeTailParam: {},
        routeParams: {},
        queryParams: {},
        tail: null
    };

    /** Set by the Router when adding the route */
    routeId:string|null = null;

    /** Set from/by the DomxRoute */
    _parentRoute:Route|null = null;
    get parentRoute():Route|null { return this._parentRoute; };
    set parentRoute(route:Route|null) {
        this._parentRoute = route;
        this.parentRouteChanged();
    };

    element:string = "";
    appendTo:string = "";
    _pattern:string|null = null;
    set pattern(pattern:string|null) {
        if (this._pattern === null) {
            this._pattern = pattern;
        } else if (this._pattern !== pattern) {
            throw new Error("DomxRouteData: route pattern cannot be changed");
        }
    }
    get pattern():string { return this._pattern || "" }


    /**
     * Set by the DomxRoute when DomxLocation.location changes
     * on window@location-changed
     */
    private __location:RouteLocation|null = null;

    set location(location:RouteLocation) { 
        this.__location = location;
        this.locationChanged();
    }

    @dataProperty()
    state:RouteState = DomxRouteData.defaultState;

    @dataProperty({changeEvent: "route-info-changed"})
    routeInfo:RouteInfo|null = null;

    parentRouteChanged() {
        this.__location && this.locationChanged();
    }

    /** 
     * Update the state when the location changes.
     */
    locationChanged() {
        const location = this.__location as RouteLocation;
        const {matches, routeParams: routeData, routeTailParam, tail} = Router.matchRoute(this, location.url);
        this.dispatchChange("state", {
            routeId: this.routeId as string,
            url: location.url,
            parentRoute: this.parentRoute,
            routeTailParam,
            matches,
            routeParams: routeData,            
            queryParams: location.queryParams,
            tail
        });
    }

    connectedCallback() {
        Router.addRoute(this);
        super.connectedCallback();
        this.updateRouteInfo();
    }

    updateRouteInfo() {
        const { pattern, element, appendTo } = this;
        this.dispatchChange("routeInfo", {
            pattern,
            element,
            appendTo
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        Router.removeRoute(this);
    }
}
