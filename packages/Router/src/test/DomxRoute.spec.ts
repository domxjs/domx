import { describe, it, expect, jest } from "@jest/globals";
import {fixture, html} from "@domx/testutils";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import { ifDefined } from "lit/directives/if-defined";
import { QueryParams, Router } from "../Router";
import { DomxRoute } from "../DomxRoute";
import { DomxRouteData } from "../DomxRouteData";


describe("DomxRoute", () => {
    it("exists", () => {
        expect(DomxRoute).toBeDefined();
    });


    describe("element creation", () => {
        afterEach(() => {
            Router._reset();
            window.history.replaceState({}, "", "/");
        });

        it("gets created when the route matches", () => {
            const route = getRoute({pattern:"/"});
            const el = document.querySelector("test-el");
            expect(el).toBeDefined();
            route.remove();
        });

        it("gets removed when the route is removed", () => {
            const route = getRoute({pattern:"/"});            
            route.remove();
            const el = document.querySelector("test-el");
            expect(el).toBeNull();
        });

        it("gets inserted into the parent by default", async () => {
            const container = getRouteContainer({pattern:"/"});
            await container.updateComplete;
            const el = (container as any).shadowRoot.querySelector("test-el");
            expect(el.tagName).toBe("TEST-EL");
            container.remove();
        });

        it("can be inserted into the body", async () => {
            const container = getRouteContainer({pattern:"/", appendTo: "body"}) as any;
            await container.updateComplete;
            const routeEl = container.shadowRoot.querySelector("domx-route") as DomxRoute;
            await routeEl.updateComplete;
            expect(window.location.pathname).toBe("/");
            const element = document.body.querySelector("test-el") as HTMLElement;
            expect(element.tagName).toBe("TEST-EL");
            container.remove();
        });

        it("gets inserted using a DOM query", async () => {
            const container = getRouteContainer({pattern:"/", appendTo: "#container"}) as any;
            await container.updateComplete;
            const routeEl = container.shadowRoot.querySelector("domx-route") as DomxRoute;
            await routeEl.updateComplete;
            const el = (container as any).shadowRoot.querySelector("#container test-el");
            expect(el.tagName).toBe("TEST-EL");
            container.remove();
        });

        it("throws error if route pattern is changed", async () => {
            const rd = new DomxRouteData();
            rd.pattern = "/";
            const changePattern = () => {
                rd.pattern = "/should/fail";
            }
            expect(changePattern).toThrow();
        });
    });

    describe("params", () => {
        afterEach(() => {
            Router._reset();
            window.history.replaceState({}, "", "/");
        });

        it("creates routeParams as attributes", async () => {
            const route = getRoute({pattern:"/:user-id"});
            let el = document.querySelector("test-el") as TestEl;
            expect(el).toBeNull();
            Router.replaceUrl("/1234");
            await route.updateComplete;
            el = document.querySelector("test-el") as TestEl;
            expect(el.getAttribute("user-id")).toBe("1234");
            expect(el.userId).toBe(1234);
            route.remove();
        });

        it("add queryParams as a property", async () => {
            const route = getRoute({pattern:"/test"});
            let el = document.querySelector("test-el") as TestEl;
            expect(el).toBeNull();
            Router.replaceUrl("/test?foo=bar&baz=bam");
            await route.updateComplete;
            el = document.querySelector("test-el") as TestEl;
            expect(el.queryParams).toStrictEqual({
                foo: "bar",
                baz: "bam"
            });
            route.remove();
        });

    });

    describe("subroutes", () => {

        afterEach(() => {
            Router._reset();
            window.history.replaceState({}, "", "/");
        });

        it("supports an inner subroute", async () => {
            Router.replaceUrl("/users/profile");
            const container = getRouteContainer({
                pattern:"/users/*routeTail",
                subroutePattern: "/profile/:test"
            });
            await container.updateComplete;
            const subRoute = (container as any).shadowRoot.querySelector("#subroute");
            Router.replaceUrl("/users/profile/worked");
            await container.updateComplete;
            await subRoute.updateComplete;
            const el = (container as any).shadowRoot.querySelectorAll("test-el")[1];
            expect(el.tagName).toBe("TEST-EL");
            expect(el.getAttribute("test")).toBe("worked");
            container.remove();            
        });

        // jch
        // have to update code for this
        // add test that parentRoute routeParameters are added to subroutes
 

    });

    describe("route events", () => {

        afterEach(() => {
            Router._reset();
            window.history.replaceState({}, "", "/");
        });

        it("dispatches an active event when the route matches", async () => {
            const route = getRoute({pattern:"/test"});
            let el = document.querySelector("test-el") as TestEl;
            let activeEvent:CustomEvent|null = null;
            const listener = ((event:CustomEvent) => {
                activeEvent = event;
            }) as EventListener;
            route.addEventListener("route-active", listener);
            Router.replaceUrl("/test");
            await route.updateComplete;
            el = document.querySelector("test-el") as TestEl;
            expect(activeEvent).not.toBeNull();
            expect((activeEvent as unknown as CustomEvent).detail.element).toBe(el);
            route.removeEventListener("route-active", listener);
            route.remove();
        });

        it("dispatches an inactive event when the route matches", async () => {
            const route = getRoute({pattern:"/test"});
            let el = document.querySelector("test-el") as TestEl;
            let activeEvent:CustomEvent|null = null;
            const listener = ((event:CustomEvent) => {
                activeEvent = event;
            }) as EventListener;
            route.addEventListener("route-inactive", listener);
            Router.replaceUrl("/test");
            await route.updateComplete;
            el = document.querySelector("test-el") as TestEl;
            expect(el).not.toBeNull();
            Router.replaceUrl("/");
            await route.updateComplete;
            expect((activeEvent as unknown as CustomEvent).detail.element).toBe(el);
            route.removeEventListener("route-inactive", listener);
            route.remove();
        })
    });

    describe("navigate", () => {
        afterEach(() => {
            Router._reset();
            window.history.replaceState({}, "", "/");
        });

        it("navigates to the correct url", () => {
            const route = getRoute({pattern:"/test"});
            expect(window.location.pathname).toBe("/");
            route.navigate();
            expect(window.location.pathname).toBe("/test");
        });

        it("navigates to the correct url with queryParams", () => {
            const route = getRoute({pattern:"/test"});
            expect(window.location.pathname).toBe("/");
            route.navigate({
                queryParams: {test:"worked"}
            });
            expect(window.location.pathname).toBe("/test");
            expect(window.location.search).toBe("?test=worked");
        });


        it("navigates to the correct url when it has a parent route", async () => {
            const container = getRouteContainer({
                pattern:"/users/*routeTail",
                subroutePattern: "/profile/:test"
            });
            await container.updateComplete;
            const subRoute = (container as any).shadowRoot.querySelector("#subroute") as DomxRoute;
            subRoute.navigate({routeParams: {test: "worked"}});
            expect(window.location.pathname).toBe("/users/profile/worked");
            container.remove();
        });


        // jch
        // navigates with a parent route.
        // can update parents with routeData

    });
});


const timeout = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));



const getRoute = ({pattern, appendTo}:{pattern:string, appendTo?:string}):DomxRoute => {
    return fixture<DomxRoute>(html`
        <domx-route
            pattern=${pattern}
            element="test-el"
            append-to="${ifDefined(appendTo)}"
        ></domx-route>
    `);
};

const getRouteContainer = (
    {pattern, appendTo, subroutePattern}:
    {pattern:string, appendTo?:string, subroutePattern?:string})
    :RouteContainer => {
    return fixture<RouteContainer>(html`
        <route-container
            route-pattern=${pattern}
            route-append-to="${ifDefined(appendTo)}"
            subroute-pattern="${subroutePattern}"
        ></route-container>
    `);
};

@customElement("route-container")
class RouteContainer extends LitElement {

    @property({attribute: "route-pattern"})
    routePattern:string|null = null;

    @property({attribute:"route-append-to"})
    routeAppendTo:string|null = null;

    @property({attribute:"subroute-pattern"})
    subroutePattern:string|null = null;

    render() {
        return html`
            <domx-route
                pattern=${this.routePattern}
                element="test-el"
                append-to="${ifDefined(this.routeAppendTo)}">
                ${this.subroutePattern ? html`
                    <domx-route
                        id="subroute"
                        pattern="${this.subroutePattern}"
                        element="test-el"
                    ></domx-route>
                `: ``}                
            </domx-route>
            <div id="container"></div>
        `;
    }
}

@customElement("test-el")
class TestEl extends LitElement {
    @property({type:Number, attribute: "user-id"})
    userId:number|null = null;

    queryParams:QueryParams|null = null;
}

