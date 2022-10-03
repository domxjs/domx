import { describe, it, expect, jest } from "@jest/globals";
import {fixture, html} from "@domx/testutils";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { QueryParams, Router } from "../Router";
import { DomxRoute } from "../domx-route";
import { DomxRouteData } from "../domx-route-data";


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

        it("adds parent route params as subroute element attributes", async () => {
            Router.replaceUrl("/users/1234/profile");
            const container = getRouteContainer({
                pattern:"/users/:user-id/*routeTail",
                subroutePattern: "/profile/:test"
            });
            await container.updateComplete;
            const subRoute = (container as any).shadowRoot.querySelector("#subroute");
            Router.replaceUrl("/users/1234/profile/worked");
            await container.updateComplete;
            await subRoute.updateComplete;
            const el = (container as any).shadowRoot.querySelectorAll("test-el")[1];
            expect(el.tagName).toBe("TEST-EL");
            expect(el.getAttribute("test")).toBe("worked");
            expect(el.getAttribute("user-id")).toBe("1234");
            container.remove();
        });

        it("updates the parent route when parent route tail changes", async () => {
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
            let el = (container as any).shadowRoot.querySelectorAll("test-el")[1];
            expect(el.tagName).toBe("TEST-EL");
            expect(el.getAttribute("test")).toBe("worked");
            Router.replaceUrl("/users/profile/worked-again");
            await container.updateComplete;
            await subRoute.updateComplete;
            el = (container as any).shadowRoot.querySelectorAll("test-el")[1];
            expect(el.getAttribute("test")).toBe("worked-again");
            Router.replaceUrl("/users/profile/new");
            await container.updateComplete;
            await subRoute.updateComplete;
            el = (container as any).shadowRoot.querySelectorAll("test-el")[1];
            expect(el.getAttribute("test")).toBe("new");
            container.remove();            
        });
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
        });

        it("can call preventDefault on active", async () => {
            const route = getRoute({pattern:"/test"});
            let el = document.querySelector("test-el") as TestEl;
            let event:CustomEvent|null = null;            
            const listener = ((e:CustomEvent) => {
                event = e;
                e.preventDefault();
            }) as EventListener;
            route.addEventListener("route-active", listener);
            Router.replaceUrl("/test");
            await route.updateComplete;
            el = document.querySelector("test-el") as TestEl;
            expect(event!.defaultPrevented).toBe(true);            
            route.removeEventListener("route-active", listener);
            route.remove();
        });

        it("can call preventDefault on inactive", async () => {
            const route = getRoute({pattern:"/test"});
            let el = document.querySelector("test-el") as TestEl;
            let event:CustomEvent|null = null;
            const listener = ((e:CustomEvent) => {
                event = e;
                e.preventDefault();
            }) as EventListener;
            route.addEventListener("route-inactive", listener);
            Router.replaceUrl("/test");
            await route.updateComplete;
            el = document.querySelector("test-el") as TestEl;
            expect(el).not.toBeNull();
            Router.replaceUrl("/");
            await route.updateComplete;
            expect(event!.defaultPrevented).toBe(true);            
            route.removeEventListener("route-active", listener);
            route.remove();
        });
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
            route.remove();
        });

        it("navigates to the correct url with queryParams", () => {
            const route = getRoute({pattern:"/test"});
            expect(window.location.pathname).toBe("/");
            route.navigate({
                queryParams: {test:"worked"}
            });
            expect(window.location.pathname).toBe("/test");
            expect(window.location.search).toBe("?test=worked");
            route.remove();
        });

        it("navigates to the correct url with route params", () => {
            const route = getRoute({pattern:"/test/:test"});
            expect(window.location.pathname).toBe("/");
            route.navigate({
                routeParams: {test:"worked"}
            });
            expect(window.location.pathname).toBe("/test/worked");
            route.remove();
        });

        it("throws an error if route params are not specified", () => {
            const route = getRoute({pattern:"/test/:test"});
            expect(window.location.pathname).toBe("/");
            expect(() => route.navigate()).toThrow();
            route.remove();
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

        it("navigates to the correct url when it has a parent route with params", async () => {
            Router.pushUrl("/users/1234/profile")
            const container = getRouteContainer({
                pattern:"/users/:user-id/*routeTail",
                subroutePattern: "/profile/:test"
            });
            await container.updateComplete;
            const parentRoute = (container as any).shadowRoot.querySelector("domx-route") as DomxRoute;
            await parentRoute.updateComplete;
            const subRoute = (container as any).shadowRoot.querySelector("#subroute") as DomxRoute;
            await subRoute.updateComplete;
            subRoute.navigate({routeParams: {test: "worked"}});
            expect(window.location.pathname).toBe("/users/1234/profile/worked");
            container.remove();
        });

    });

    describe("cache", () => {
        afterEach(() => {
            Router._reset();
            window.history.replaceState({}, "", "/");
            document.body.innerHTML = "";
        });

        it("does not allow cache-count to go below 1", () => {
            const r = new DomxRoute();
            expect(r.cacheCount).toBe(1);
            r.cacheCount = 10;
            expect(r.cacheCount).toBe(10);
            r.cacheCount = 0;
            expect(r.cacheCount).toBe(1);
            r.cacheCount = -1;
            expect(r.cacheCount).toBe(1);
        });

        it("caches elements as expected", async () => {
            const route = getRoute({pattern:"/:user-id"});
            route.cacheCount = 3;
            let el = document.querySelector("test-el") as TestEl;
            expect(el).toBeNull();
            Router.replaceUrl("/1");
            await route.updateComplete;
            el = document.querySelector("test-el") as TestEl;
            expect(el.getAttribute("user-id")).toBe("1");
            expect(el.userId).toBe(1);
            expect(route.cachedElements.length).toBe(1);
            //
            Router.replaceUrl("/2");
            await route.updateComplete;
            const el2 = document.querySelector("test-el") as TestEl;
            expect(route.cachedElements.length).toBe(2);
            //
            Router.replaceUrl("/3");
            await route.updateComplete;
            expect(route.cachedElements.length).toBe(3);
            //
            Router.replaceUrl("/4");
            await route.updateComplete;
            expect(route.cachedElements.length).toBe(3);
            //
            Router.replaceUrl("/2");
            await route.updateComplete;
            expect(el).not.toBe(el2);
            el = document.querySelector("test-el") as TestEl;
            expect(el).toBe(el2);
            route.remove();
        });

    });
});



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

