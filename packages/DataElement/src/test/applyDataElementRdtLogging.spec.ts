import { describe, it, expect } from "@jest/globals";
import {fixture, html} from "@domx/testutils";
import {customDataElement, DataElement} from "../DataElement";
import {applyDataElementRdtLogging} from "../applyDataElementRdtLogging";

describe("applyDataElementRdtLogging", () => {

    afterEach(() => {
        DataElement.clearMiddleware();
        applyDataElementRdtLogging.reset();
    });

    it("test", () => {
        applyDataElementRdtLogging();
        const el = fixture<TestEl>(html`<test-el></test-el>`);
        el.restore();
    });
    
    // test that connected elements are removed correctly
    // test logChangeEvents option
    // test pushing both events and statechange works
    // test pushing from rdt works - and that multiple elements get updated
});


@customDataElement("test-el")
class TestEl extends DataElement {
    state = {
        status: "unknown"
    };

    test1() {
        this.state = {
            ...this.state,
            status: "test1"
        };
        this.dispatchChange();
    }
}
