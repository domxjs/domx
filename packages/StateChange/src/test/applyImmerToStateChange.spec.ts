import { html, fixture, TestStateChange } from "./testHelpers";
import {applyImmerToStateChange} from "../applyImmerToStateChange";
import {StateChange} from "../StateChange";

describe("applyImmerToStateChange", () => {

    beforeEach(() => {
        applyImmerToStateChange();
    });

    afterEach(() => {
        StateChange.clearMiddleware();
        applyImmerToStateChange.reset();
    });

    it("handles state mutations", () => {       
        const el = fixture<TestStateChange>(html`<test-state-change></test-state-change>`);
        el.testImmer();
        expect(el.state).toStrictEqual({foo:false, bar:true, newArray:[1]})
        el.restore();
    });

   
    it("warns if called twice", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
        expect(warnSpy).toHaveBeenCalledTimes(0);
        applyImmerToStateChange();
        expect(warnSpy).toHaveBeenCalledTimes(1);
    });
});