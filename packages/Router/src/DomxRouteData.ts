import { DataElement, customDataElement, dataProperty } from "@domx/dataelement";
import { Router, Route, RouteLocation, RouteState, RouteInfo } from "./Router";
export { DomxRouteData }

@customDataElement("domx-route-data", {stateIdProperty: "routeId"})
class DomxRouteData extends DataElement {
    static defaultState:RouteState = {
        routeId: "",
        matches: false,
        queryParams: {},
        routeParams: {},
        tail: null,
        url: ""
    };

    /** Set by the Router when adding the route */
    routeId:string|null = null;

    /** Set from/by the DomxRoute */
    parentRoute:Route|null = null;
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

    /** 
     * Update the state when the location changes.
     */
    locationChanged() {
        this.updateRouteInfo();
        const location = this.__location as RouteLocation;
        const {matches, routeParams: routeData, tail} = Router.MatchRoute(this, location.url);
        this.state = {
            routeId: this.routeId as string,
            url: location.url,
            queryParams: location.queryParams,
            matches,
            routeParams: routeData,            
            tail
        };
        this.dispatchChange();
    }

    connectedCallback() {
        super.connectedCallback();
        Router.addRoute(this);
        this.updateRouteInfo();
    }

    updateRouteInfo() {
        const { parentRoute, pattern, element, appendTo } = this;
        this.routeInfo = {
            parentRoute,
            pattern,
            element,
            appendTo
        };
        this.dispatchChange("routeInfo");
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        Router.removeRoute(this);
    }
}
