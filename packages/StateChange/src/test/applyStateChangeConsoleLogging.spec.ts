import { html, fixture } from "./testHelpers";
import {applyStateChangeConsoleLogging} from "../applyStateChangeConsoleLogging";
import {StateChange} from "../StateChange";

describe("applyStateChangeConsoleLogging", () => {

    beforeEach(() => {
        applyStateChangeConsoleLogging();
    });

    afterEach(() => {
        StateChange.clearMiddleware();
        applyStateChangeConsoleLogging.reset();
    });

    it("provides next logging", () => {
        const logSpy = jest.spyOn(console, "info").mockImplementation(() => {});
        const groupCollapsedSpy = jest.spyOn(console, "group").mockImplementation(() => {});
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testSimple();
        expect(logSpy).toBeCalled();
        expect(logSpy).toHaveBeenCalledWith("> STATECHANGE next state:", {foo: true, bar: false})
        expect(groupCollapsedSpy).toHaveBeenCalledWith("> STATECHANGE.next: TestStateChange.setBar()");
        logSpy.mockRestore();
        groupCollapsedSpy.mockRestore();
        el.restore();
    });

    it("provides tap logging", async () => {
        const logSpy = jest.spyOn(console, "group").mockImplementation(() => {});
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testFunction();
        await setTimeout(() => {});
        expect(logSpy).toBeCalled();
        expect(logSpy).toHaveBeenCalledWith("> STATECHANGE.next: TestStateChange.asyncTest(setFooTrue)");
        expect(logSpy).toHaveBeenCalledWith("> STATECHANGE.next: TestStateChange.asyncTest(setBarTrue)");
        logSpy.mockRestore();
        el.restore();
    });

    it("supports collapsed groups", () => {
        StateChange.clearMiddleware();
        applyStateChangeConsoleLogging.reset();
        applyStateChangeConsoleLogging({collapsed:true});
        const logSpy = jest.spyOn(console, "info").mockImplementation(() => {});
        const groupCollapsedSpy = jest.spyOn(console, "groupCollapsed").mockImplementation(() => {});
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testSimple();
        expect(logSpy).toBeCalled();
        expect(logSpy).toHaveBeenCalledWith("> STATECHANGE next state:", {foo: true, bar: false})
        expect(groupCollapsedSpy).toHaveBeenCalledWith("> STATECHANGE.next: TestStateChange.setBar()");
        logSpy.mockRestore();
        groupCollapsedSpy.mockRestore();
        el.restore();
    });

    it("warns if called twice", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
        expect(warnSpy).toHaveBeenCalledTimes(0);
        applyStateChangeConsoleLogging();
        expect(warnSpy).toHaveBeenCalledTimes(1);
    });
});