import { DataElement, customDataElement, dataProperty, event } from "@domx/dataelement";
import { RouteLocation, LocationChangedDetail, QueryParams } from "./Router";
export { DomxLocation }

/**
 * Used by all domx-route elements to provide
 * a parsed window location and stores the event
 * detail from the location-changed event.
 */
 @customDataElement("domx-location")
 class DomxLocation extends DataElement {
 
     @dataProperty()
     location:RouteLocation = {
         url: "",
         pathname: "",
         queryParams: {}
     };
 
     locationChangedDetail:LocationChangedDetail = {};
 
     @event("location-changed", {listenAt: "window"})
     locationChanged({detail}:{detail:LocationChangedDetail}) {        
        this.locationChangedDetail = detail || {};
        const { pathname, search } = window.location;
        const url = `${pathname}${search}`;
        const queryParams = parseQueryParams();
        this.location = {
            url,
            pathname,
            queryParams
        };
        this.dispatchChange("location");
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
 