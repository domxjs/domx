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

        const {matches, routeParams: routeData, tail} = Router.MatchRoute(this, this.__location.url);

        this.state = {
            routeId: this.routeId as string,
            url: this.__location.url,
            queryParams: this.__location.queryParams,
            matches,
            routeParams: routeData,            
            tail
        };
        this.dispatchChange();


        // jch also need to set routeInfo from DomxRoute! and dispatchChange?

    }

    connectedCallback() {
        Router.addRoute(this);
    }

    disconnectedCallback() {
        Router.removeRoute(this);
    }
}
