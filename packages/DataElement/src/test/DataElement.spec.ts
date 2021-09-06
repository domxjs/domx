import { describe, it, expect } from "@jest/globals";
import { fixture, html} from "@domx/testutils/fixture";
import {
    customDataElement,
    DataElement,
    DataElementCtor
} from "../DataElement";


describe("DataElement", () => {
    it("it can define an element", () => {
        const el = fixture(html`<test-data-element></test-data-element>`);
        expect(el.tagName).toBe("TEST-DATA-ELEMENT");
    });

    it("it adds the __elementName", () => {
        const el = fixture(html`<test-data-element></test-data-element>`);
        expect((el.constructor as DataElementCtor).__elementName).toBe("test-data-element");
    });

    it("expands the data properties", () => {
        const el = fixture(html`<test-data-element></test-data-element>`);
        const ctor = el.constructor as DataElementCtor;
        expect(ctor.dataProperties["state"].statePath).toBe("test-data-element.state");
    });

    it("expands the data properties with a stateId", () => {
        const el = fixture(html`<test-instance-data-element user-id="1234"></test-instance-data-element>`);
        const ctor = el.constructor as DataElementCtor;
        expect(ctor.dataProperties["user"].statePath).toBe("test-instance-data-element.user.1234");
    });

    // todo add tests
    // add test for state being removed after 1+ insertions/removals
});


@customDataElement("test-data-element")
class TestDataElement extends DataElement {
    state = {
        status: "default"
    };
}

@customDataElement("test-instance-data-element")
class TestInstanceDataElement extends DataElement {
    static stateIdProperty = "userId";
    static dataProperties = {
        "user": {changeEvent:"user-changed"}
    }

    userId:string|null = null;

    user = {
        userName: "unknown"
    };

    constructor() {
        super();
        this.userId = this.getAttribute("user-id");    
    }
}
