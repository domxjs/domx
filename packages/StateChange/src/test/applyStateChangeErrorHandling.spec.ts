import { html, fixture, TestStateChange } from "./testHelpers";
import {applyStateChangeErrorHandling} from "../applyStateChangeErrorHandling";
import {StateChange} from "../StateChange";

describe("applyStateChangeErrorHandling", () => {
    it("logs errors on next", () => {
        applyStateChangeErrorHandling();
        const logSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        const el = fixture<TestStateChange>(html`<test-state-change></test-state-change>`);
        //@ts-ignore
        const testErrorSpy = jest.spyOn(el, "testError");
        try {
            el.testError();      
        } catch (e) {
            expect(logSpy).toBeCalledWith("StateChange error!", e);
        }
        el.restore();
        StateChange.clearMiddleware();
        applyStateChangeErrorHandling.reset();
    });

    it("logs errors on tap", () => {
        applyStateChangeErrorHandling();
        const logSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        const el = fixture<TestStateChange>(html`<test-state-change></test-state-change>`);
        //@ts-ignore
        const testErrorSpy = jest.spyOn(el, "testError");
        try {
            el.testTapError();      
        } catch (e) {
            expect(logSpy).toBeCalledWith("StateChange error!", e);
        }
        el.restore();
        StateChange.clearMiddleware();
        applyStateChangeErrorHandling.reset();
    });

    it("warns if called twice", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
        applyStateChangeErrorHandling();
        expect(warnSpy).toHaveBeenCalledTimes(0);
        applyStateChangeErrorHandling();
        expect(warnSpy).toHaveBeenCalledTimes(1);
        StateChange.clearMiddleware();
        applyStateChangeErrorHandling.reset();
    });
});