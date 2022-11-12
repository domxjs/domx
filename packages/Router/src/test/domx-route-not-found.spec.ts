import { describe, it, expect, jest } from "@jest/globals";
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { fixture } from "@domx/testutils";
import { Router } from "../Router";
import "../domx-route";
import "../domx-route-not-found";
import { DomxRouteNotFound } from "../domx-route-not-found";
import { DomxRoute } from "../domx-route";


describe("domx-route-not-found", () => {

    afterEach(() => {
        Router._reset();
        window.history.replaceState({}, "", "/");
    });
    
    it("does not activate the element when a route matches", async () => {
        Router.replaceUrl("/test");
        const testEl = fixture<TestElement>(html`<test-element></test-element>`)
        await testEl.updateComplete;
        await testEl.$routeNotFound.updateComplete;
        expect(testEl.$routeNotFound.isActive).toBe(false);
        testEl.restore();
    });

    it("does activate the element when a route does not matches", async () => {
        Router.replaceUrl("/notfound");
        const testEl = fixture<TestElement>(html`<test-element></test-element>`)
        await testEl.updateComplete;
        await testEl.$routeNotFound.updateComplete;
        expect(testEl.$routeNotFound.isActive).toBe(true);
        testEl.restore();
    });

    it("does not activate the element when a sub route matches", async () => {
        Router.replaceUrl("/test/subroute/test");
        const testEl = fixture<TestElement>(html`<test-element></test-element>`)
        await testEl.updateComplete;
        await testEl.$subroute.updateComplete;
        expect(testEl.$subrouteNotFound.isActive).toBe(false);
        testEl.restore();
    });

    it("does activate the element when a sub route does not matches", async () => {
        Router.replaceUrl("/test/subroute/not/found");
        const testEl = fixture<TestElement>(html`<test-element></test-element>`)
        await testEl.updateComplete;
        await testEl.$subroute.updateComplete;
        await testEl.$subrouteNotFound.updateComplete;
        expect(testEl.$subrouteNotFound.isActive).toBe(true);
        testEl.restore();
    });

    
    it("calls preventDefault on the route-not-found event", async () => {
        const testEl = fixture<TestElement>(html`<test-element></test-element>`);
        await testEl.updateComplete;
        await testEl.$routeNotFound.updateComplete;
        (testEl.shadowRoot?.querySelector("#not-found-link") as HTMLAnchorElement).click();
        expect(testEl.$routeNotFound.isActive).toBe(true);
        testEl.restore();
    });

    it("throws an error if an element is not defined", async () => {    
        Router.replaceUrl("/test");   
        const testEl = fixture<TestElement>(html`<test-element></test-element>`)
        await testEl.updateComplete;
        testEl.$routeNotFound.removeAttribute("element");
        expect(() => { testEl.$routeNotFound.activate(); }).toThrow();
        testEl.restore();
    });

});


@customElement("test-element")
class TestElement extends LitElement {

    @query("#subroute")
    $subroute!:DomxRoute;

    @query("#routeNotFound")
    $routeNotFound!:DomxRouteNotFound;

    @query("#subrouteNotFound")
    $subrouteNotFound!:DomxRouteNotFound;

    render() {
        return html`
            <domx-route
                pattern="/test"
                element="div">                     
            </domx-route>
            <domx-route                
                pattern="/test/subroute/*routeTail"
                element="div">
                <domx-route
                    id="subroute"
                    pattern="/test"
                ></domx-route>
                <domx-route-not-found
                    id="subrouteNotFound"
                    element="test-not-found-element"
                ></domx-route-not-found>
            </domx-route>       
            <domx-route-not-found
                id="routeNotFound"
                element="test-not-found-element"
            ></domx-route-not-found>
            <a href="/not-found" id="not-found-link">not found</a>
        `;
    }
}


@customElement("test-not-found-element")
class TestNotFoundElement extends LitElement {
    render() {
        return html`<h1>Not Found</h1>`;
    }
}
