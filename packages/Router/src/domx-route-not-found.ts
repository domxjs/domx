import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { DomxLocation } from "./domx-location";
import { RouteLocation } from "./Router";
import { appendElement } from "./domxRoute";
import { DomxRoute } from "./domx-route";
export { DomxRouteNotFound }

/**
 * 
 */
 @customElement("domx-route-not-found")
 class DomxRouteNotFound extends LitElement {

    @property({type: String})
    element:string|null = null;

    @property({type: String, attribute: "append-to"})
    appendTo:string = "parent";

    private _location:RouteLocation|null = null;

    private _activeElement:HTMLElement|null = null;
    private _isSubroute:boolean = false;
    private _routesToCheck!:Array<DomxRoute>;

    connectedCallback() {
        super.connectedCallback && super.connectedCallback();
        
        // determine if this is a subroute and locate the routes to check
        this._isSubroute = this.parentElement instanceof DomxRoute;
        if (this._isSubroute && this.parentElement) {
            this._routesToCheck = Array.from(this.parentElement.querySelectorAll("domx-route"));
        } else {
            this._routesToCheck = Array.from(
                (this.getRootNode() as Element).querySelectorAll(":scope > domx-route")
            );
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback && super.disconnectedCallback();
        this.deactivate();
    }

    @query("domx-location")
    $location!:DomxLocation;

    render() {
        return html`
            <domx-location
                @state-changed="${this.locationChanged}"
            ></domx-location>
        `
    }

    async locationChanged() {
        this._location = this.$location.location;
        await this.updateComplete;
        if (this._isSubroute) {
            await (this.parentElement as DomxRoute).updateComplete;
        }
        
        this._isSubroute == false ?
            this._activateIfRoutesDontMatch() :
            (this.parentElement as DomxRoute).routeState.matches ?
                this._activateIfRoutesDontMatch() :
                this.deactivate();
    }

    _activateIfRoutesDontMatch() {        
        const match = this._routesToCheck.find(r => r.routeState.matches);
        match ? this.deactivate() : this.activate();
    }

    activate() {
        if (!this.element) {
            throw new Error("An element is required.")
        }

        const el = document.createElement(this.element);
        appendElement(this, el);
        this._activeElement = el;
    }

    deactivate() {
        this._activeElement?.remove();
    }
 }



 