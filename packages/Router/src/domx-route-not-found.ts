import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { appendElement, setElementProperties } from "./domxRoute";
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

    private _activeElement:HTMLElement|null = null;

    connectedCallback() {
        super.connectedCallback && super.connectedCallback();
       
    }

    disconnectedCallback() {
        super.disconnectedCallback && super.disconnectedCallback();
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



 