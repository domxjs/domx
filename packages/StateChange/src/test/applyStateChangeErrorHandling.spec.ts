import { html, fixture } from "./testHelpers";
import {applyStateChangeErrorHandling} from "../applyStateChangeErrorHandling";
import {StateChange} from "../StateChange";

describe("applyStateChangeErrorHandling", () => {
    it("logs errors on next", () => {
        applyStateChangeErrorHandling();
        const logSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        const el = fixture(html`<test-state-change></test-state-change>`);
        //@ts-ignore
        const testErrorSpy = jest.spyOn(el, "testError");
        try {
            el.testError();      
        } catch (e) {
            expect(logSpy).toBeCalledWith("StateChange error!", e);
        }
        el.restore();
        StateChange.clearMiddleware();
    });

    it("logs errors on tap", () => {
        applyStateChangeErrorHandling();
        const logSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        const el = fixture(html`<test-state-change></test-state-change>`);
        //@ts-ignore
        const testErrorSpy = jest.spyOn(el, "testError");
        try {
            el.testTapError();      
        } catch (e) {
            expect(logSpy).toBeCalledWith("StateChange error!", e);
        }
        el.restore();
        StateChange.clearMiddleware();
    });
});