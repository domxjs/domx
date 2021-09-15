import { describe, it, expect } from "@jest/globals";
import { html, render } from "lit";
import { applyEventMapLogging } from "./applyEventMapLogging";
import {EventMap, event} from "./EventMap";


describe("applyEventMapLogging", () => {

    it("can be applied", () => {
        expect(() => applyEventMapLogging()).not.toThrow();
        EventMap.clearMiddleware();
        applyEventMapLogging.reset();
    });

    it("logs event data", () => {
        applyEventMapLogging();
        render(testMiddlewareHtml, document.body);
        const el = document.querySelector("test-middleware") as HTMLElement;        
        const groupSpy = jest.spyOn(console, "group").mockImplementation(() => {});
        const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
        const groupEndSpy = jest.spyOn(console, "groupEnd").mockImplementation(() => {});
        el.dispatchEvent(new CustomEvent("test-event"));
        expect(groupSpy).toHaveBeenCalledTimes(1);
        expect(groupSpy).toHaveBeenCalledWith("> EVENTMAP: TestMiddleware@test-event => TestMiddleware.testEvent()");
        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith("=> event.detail", "(none)");
        expect(groupEndSpy).toHaveBeenCalledTimes(1);
        groupSpy.mockRestore();
        infoSpy.mockRestore();
        groupEndSpy.mockRestore();
        EventMap.clearMiddleware();
        applyEventMapLogging.reset();
    });

    it("logs event data collapsed", () => {
        applyEventMapLogging({collapsed: true});
        render(testMiddlewareHtml, document.body);
        const el = document.querySelector("test-middleware") as HTMLElement;        
        const groupSpy = jest.spyOn(console, "groupCollapsed").mockImplementation(() => {});
        const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
        const groupEndSpy = jest.spyOn(console, "groupEnd").mockImplementation(() => {});
        el.dispatchEvent(new CustomEvent("test-event"));
        expect(groupSpy).toHaveBeenCalledTimes(1);
        expect(groupSpy).toHaveBeenCalledWith("> EVENTMAP: TestMiddleware@test-event => TestMiddleware.testEvent()");
        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith("=> event.detail", "(none)");
        expect(groupEndSpy).toHaveBeenCalledTimes(1);
        groupSpy.mockRestore();
        infoSpy.mockRestore();
        groupEndSpy.mockRestore();
        EventMap.clearMiddleware();
        applyEventMapLogging.reset();
    });

    it("warns if called twice", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
        applyEventMapLogging();
        expect(warnSpy).toHaveBeenCalledTimes(0);
        applyEventMapLogging();
        expect(warnSpy).toHaveBeenCalledTimes(1);
        applyEventMapLogging.reset();
    });
});


const testMiddlewareHtml = html`<test-middleware></test-middleware>`;

class TestMiddleware extends EventMap(HTMLElement) {
    @event("test-event")
    testEvent() {
    }
}
customElements.define("test-middleware", TestMiddleware);
