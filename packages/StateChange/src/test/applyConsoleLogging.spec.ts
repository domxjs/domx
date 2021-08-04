import { html, fixture } from "./testHelpers";
import {applyConsoleLogging} from "../applyConsoleLogging";
import {StateChange} from "../StateChange";

describe("applyConsoleLogging", () => {
    it("provides next logging", () => {
        applyConsoleLogging();
        const logSpy = jest.spyOn(console, "info").mockImplementation(() => {});
        const groupCollapsedSpy = jest.spyOn(console, "groupCollapsed").mockImplementation(() => {});
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testSimple();
        expect(logSpy).toBeCalled();
        expect(logSpy).toHaveBeenCalledWith("> STATECHANGE next state:", {bar: true})
        expect(groupCollapsedSpy).toHaveBeenCalledWith("> STATECHANGE.next: TestStateChange.setBarTrue()");
        logSpy.mockRestore();
        groupCollapsedSpy.mockRestore();
        el.restore();
        StateChange.clearMiddleware();
    });

    it("provides tap logging", async () => {
        applyConsoleLogging();
        const logSpy = jest.spyOn(console, "group").mockImplementation(() => {});
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testFunction();
        expect(logSpy).toBeCalled();
        expect(logSpy).toHaveBeenCalledWith("> STATECHANGE.tap: TestStateChange.asyncTest()");
        logSpy.mockRestore();
        el.restore();
        StateChange.clearMiddleware();
    });
});