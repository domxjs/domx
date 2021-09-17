import { DataElement, customDataElement, dataProperty, event } from "@domx/dataelement";
import { Router } from ".";
import { RouteLocation, LocationChangedDetail, QueryParams } from "./Router";
export { DomxLocation }


/**
 * Used by all domx-route elements to provide
 * a parsed window location and stores the event
 * detail from the location-changed event.
 */
 @customDataElement("domx-location")
 class DomxLocation extends DataElement {

    static lastSourceElement:EventTarget|null = null;

    connectedCallback() {
        super.connectedCallback();
        Router.init();
    }
 
    @dataProperty()
    location:RouteLocation = {
        root: Router.root,
        url: "",
        pathname: "",
        queryParams: {}
    };

    @event("location-changed", {listenAt: "window"})
    locationChanged({detail}:{detail:LocationChangedDetail}) { 
        DomxLocation.lastSourceElement = detail.sourceElement || null;
        const { pathname, search } = window.location;
        const url = `${pathname}${search}`;
        const queryParams = parseQueryParams();
        this.dispatchChange("location", {
            url,
            pathname,
            queryParams
        });
    }
 }


 /**
  * Returns the current locations query parameters
  * as an object.
  * @returns {QueryParams}
  */
 const parseQueryParams = ():QueryParams => {
    const params:QueryParams = {};
    new URL(window.location.href).searchParams.forEach((value, key) => params[key] = value);
    return params;
 };
 