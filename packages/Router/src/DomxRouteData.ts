import { DataElement, customDataElement, dataProperty } from "@domx/dataelement";
import { Router, Route, RouteLocation, RouteState, RouteInfo } from "./Router";
export { DomxRouteData }

@customDataElement("domx-route-data", {stateIdProperty: "routeId"})
class DomxRouteData extends DataElement {

    /** Set by the Router when adding the route */
    routeId:string|null = null;

    parentRoute:Route|null = null;
    
    _pattern:string|null = null;
    set pattern(pattern:string|null) {
        if (this._pattern === null) {
            this._pattern = pattern;
        }
        throw new Error("DomxRouteData: route pattern cannot be changed");
    }
    get pattern():string|null { return this._pattern }


    /**
     * Set by the DomxRoute when DomxLocation.location changes
     * on window@location-changed
     */
    //@ts-ignore - remove
    private __location:RouteLocation = {};

    set location(location:RouteLocation) { 
        this.__location = location;
        this.locationChanged();
    }

    @dataProperty()
    state:RouteState|null = null;

    @dataProperty({changeEvent: "route-info-changed"})
    routeInfo:RouteInfo = {
        parentRoute: {path: "", prefix: ""},
        pattern: "",
        element: "",
        appendTo: "parent"
    };

    /** 
     * Update the state when the location changes.
     */
    locationChanged() {
        this.state = {
            routeId: this.routeId as string,
            url: this.__location.url,
            queryParams: this.__location.queryParams,
            matches: false,
            routeData: {},            
            tail: {path: "", prefix: ""}
        };

        // jch
        // determine if this pattern + parentRoute  matches
        // update the matches, tail, and routeData properties
        // dispatch change

        // jch also need to set routeInfo from DomxRoute
    }

    /**
     * Returns true of this is a root route
     * and the pattern matches.
     * Used by the Router to determine
     * if a route link has been clicked.
     */
    //@ts-ignore - remove
    testMatch(url:string) {
        if (this.parentRoute) {
            return false;
        }
        // else return true if pathname matches pattern!!!
    }

    connectedCallback() {
        Router.addRoute(this);
    }

    disconnectedCallback() {
        Router.removeRoute(this);
    }
}
