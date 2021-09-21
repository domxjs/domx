import { describe, it, expect, jest } from "@jest/globals";
import { LocationChangedDetail, Router } from "../Router";
import { DomxRouteData } from "../DomxRouteData";
import { fixture, html } from "@domx/testutils";


describe("Router", () => {
    
    it("exists", () => {
        expect(Router).toBeDefined();
    });

    describe("initialization", () => {
        afterEach(() => {
            Router.root = "/";
        });
    
        it("can set the root", () => {
            Router.root = "/root/path";
            expect(Router.root).toBe("/root/path");
        });

        it("throws an error if the root is set twice", () => {
            Router.root = "/root/path";
            const setRootAgain = () => Router.root = "/second/path";
            expect(setRootAgain).toThrow("Router.root has already been set.");
            expect(Router.root).toBe("/root/path");
        });

        it("triggers location-changed on init", () => {
            let handlerCalled = false;
            const handler = (event:Event) => {
                handlerCalled = true;
            };
            window.addEventListener("location-changed", handler);
            Router.init();
            expect(handlerCalled).toBe(true);
            window.removeEventListener("location-changed", handler);
        });

        it("does not trigger location-changed after calling init a second time", () => {
            let handlerCalled = false;
            const handler = (event:Event) => {
                handlerCalled = true;
            };
            window.addEventListener("location-changed", handler);
            Router.init();
            expect(handlerCalled).toBe(false);
            window.removeEventListener("location-changed", handler);
        });
    });

    describe("Route Registration", () => {
        it("can add a route", () => {
            const rd = new DomxRouteData();
            rd.pattern = "/test/pattern";
            expect(rd.routeInfo).toBe(null);
            Router.addRoute(rd);
            expect(rd.routeId).not.toBe(null);
        });

        it("throws an error if adding a route without a pattern", () => {
            const rd = new DomxRouteData();
            expect(() => {
                Router.addRoute(rd);
            }).toThrow();
        });

        it("can remove a route", () => {
            const rd = new DomxRouteData();
            rd.pattern = "/test/pattern";
            expect(rd.routeInfo).toBe(null);
            Router.addRoute(rd);
            Router.removeRoute(rd);
            expect(rd.routeId).not.toBe(null);
        })
    });

    describe("Router navigation", () => {
        it("triggers location-changed on pushUrl", () => {
            let handlerCalled = false;
            let pushState:boolean|undefined = false;
            const handler = ((event:CustomEvent) => {
                const detail = event.detail as LocationChangedDetail;
                handlerCalled = true;
                pushState = detail.pushState;
            }) as EventListener;
            window.addEventListener("location-changed", handler);
            Router.pushUrl(location.pathname);
            expect(handlerCalled).toBe(true);
            expect(pushState).toBe(true);
            window.removeEventListener("location-changed", handler);
        });

        it("triggers location-changed on replaceUrl", () => {
            let handlerCalled = false;
            let replaceState:boolean|undefined  = false;
            const handler = ((event:CustomEvent) => {
                const detail = event.detail as LocationChangedDetail;
                handlerCalled = true;
                replaceState = detail.replaceState;
            }) as EventListener;
            window.addEventListener("location-changed", handler);
            Router.replaceUrl(location.pathname);
            expect(handlerCalled).toBe(true);
            expect(replaceState).toBe(true);
            window.removeEventListener("location-changed", handler);
        });

        it("triggers location-changed on replaceUrlParams", () => {
            let handlerCalled = false;
            let replaceState:boolean|undefined  = false;
            const handler = ((event:CustomEvent) => {
                const detail = event.detail as LocationChangedDetail;
                handlerCalled = true;
                replaceState = detail.replaceState;
            }) as EventListener;
            window.addEventListener("location-changed", handler);
            Router.replaceUrlParams({test:"true"});
            expect(handlerCalled).toBe(true);
            expect(replaceState).toBe(true);
            window.removeEventListener("location-changed", handler);
        });

        it("does not trigger location-changed when urls are equal", () => {
            let handlerCalled = false;
            let replaceState:boolean|undefined  = false;
            const handler = ((event:CustomEvent) => {
                const detail = event.detail as LocationChangedDetail;
                handlerCalled = true;
                replaceState = detail.replaceState;
            }) as EventListener;
            Router.replaceUrlParams({test:"true"});
            window.addEventListener("location-changed", handler);
            Router.replaceUrlParams({test:"true"});
            expect(handlerCalled).toBe(false);
            expect(replaceState).toBe(false);
            window.removeEventListener("location-changed", handler);
        });
    });

    describe("route handling", () => {
        it("can match a route", () => {
            const rd = new DomxRouteData();
            rd.pattern = "/docs";
            const match = Router.matchRoute(rd, "/docs");
            expect(match.matches).toBe(true);
        });
       
        it("does not call preventDefault for link clicks that do not match a route", () => {
            const anchor = fixture<HTMLAnchorElement>(html`<a href="${window.location.href}"></a>`)
            const event = new MouseEvent("click", { button: 0 });
            jest.spyOn(event, "composedPath").mockImplementation(() => [anchor]);
            const preventDefaultSpy = jest.spyOn(event, "preventDefault");
            document.body.dispatchEvent(event);
            expect(preventDefaultSpy).not.toHaveBeenCalled();
        });
        
        it("does call preventDefault for link clicks that match a route", () => {
            const rd = new DomxRouteData();
            rd.pattern = window.location.pathname;
            Router.addRoute(rd);
            const anchor = fixture<HTMLAnchorElement>(html`<a href="${window.location.href}"></a>`)
            const event = new MouseEvent("click", { button: 0 });
            jest.spyOn(event, "composedPath").mockImplementation(() => [anchor]);
            const preventDefaultSpy = jest.spyOn(event, "preventDefault");
            document.body.dispatchEvent(event);
            expect(preventDefaultSpy).toHaveBeenCalled();
            Router.removeRoute(rd);
        });

        it("triggers location-changed on window@popstate to handle the back button", () => {
            let handlerCalled = false;
            const handler = ((event:CustomEvent) => {
                handlerCalled = true;
            }) as EventListener;
            window.addEventListener("location-changed", handler);
            window.dispatchEvent(new Event("popstate"));
            expect(handlerCalled).toBe(true);
            window.removeEventListener("location-changed", handler);
        });

        it("replaces state when replace-state attribute is present", () => {
            const rd = new DomxRouteData();
            rd.pattern = window.location.pathname;
            Router.addRoute(rd);
            const anchor = fixture<HTMLAnchorElement>(html`<a href="${window.location.href}" replace-state></a>`)
            const event = new MouseEvent("click", { button: 0 });
            jest.spyOn(event, "composedPath").mockImplementation(() => [anchor]);

            let handlerCalled = false;
            let replaceState:boolean|undefined  = false;
            const handler = ((event:CustomEvent) => {
                const detail = event.detail as LocationChangedDetail;
                handlerCalled = true;
                replaceState = detail.replaceState;
            }) as EventListener;
            
            window.addEventListener("location-changed", handler);
            document.body.dispatchEvent(event);
            expect(handlerCalled).toBe(true);
            expect(replaceState).toBe(true);
            window.removeEventListener("location-changed", handler);
            Router.removeRoute(rd);
        });

        it("does not handle when mouse button is not 0", () => {
            const anchor = fixture<HTMLAnchorElement>(html`<a href="${window.location.href}"></a>`)
            const event = new MouseEvent("click", { button: 1 });
            jest.spyOn(event, "composedPath").mockImplementation(() => [anchor]);
            const preventDefaultSpy = jest.spyOn(event, "preventDefault");
            document.body.dispatchEvent(event);
            expect(preventDefaultSpy).not.toHaveBeenCalled();
        });

        it("does not handle when link has a target", () => {
            const anchor = fixture<HTMLAnchorElement>(html`<a href="${window.location.href}" target="_blank"></a>`)
            const event = new MouseEvent("click", { button: 0 });
            jest.spyOn(event, "composedPath").mockImplementation(() => [anchor]);
            const preventDefaultSpy = jest.spyOn(event, "preventDefault");
            document.body.dispatchEvent(event);
            expect(preventDefaultSpy).not.toHaveBeenCalled();
        });

        it("does not handle when link does not have an href", () => {
            const anchor = fixture<HTMLAnchorElement>(html`<a></a>`)
            const event = new MouseEvent("click", { button: 0 });
            jest.spyOn(event, "composedPath").mockImplementation(() => [anchor]);
            const preventDefaultSpy = jest.spyOn(event, "preventDefault");
            document.body.dispatchEvent(event);
            expect(preventDefaultSpy).not.toHaveBeenCalled();
        });

        it("does not handle when link is outside origin", () => {
            const anchor = fixture<HTMLAnchorElement>(html`<a href="http://www.google.com"></a>`)
            const event = new MouseEvent("click", { button: 0 });
            jest.spyOn(event, "composedPath").mockImplementation(() => [anchor]);
            const preventDefaultSpy = jest.spyOn(event, "preventDefault");
            document.body.dispatchEvent(event);
            expect(preventDefaultSpy).not.toHaveBeenCalled();
        });
    });
});