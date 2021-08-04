import { html, fixture } from "./testHelpers";
import {applyErrorCatching} from "../applyErrorCatching";
import {StateChange} from "../StateChange";

describe("applyErrorCatching", () => {
    it("logs errors on next", () => {
        applyErrorCatching();
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
        applyErrorCatching();
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