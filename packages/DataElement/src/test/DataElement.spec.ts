import { describe, it, expect } from "@jest/globals";
import { fixture, html} from "@domx/testutils/fixture";
import { RootState } from "../RootState";
import {
    customDataElement,
    DataElement,
    DataElementCtor
} from "../DataElement";


describe("DataElement", () => {

    describe("data properties", () => {
        it("can define an element", () => {
            const el = fixture(html`<test-data-element></test-data-element>`);
            expect(el.tagName).toBe("TEST-DATA-ELEMENT");
            el.restore();
        });
    
        it("adds the __elementName", () => {
            const el = fixture(html`<test-data-element></test-data-element>`);
            expect((el.constructor as DataElementCtor).__elementName).toBe("test-data-element");
            el.restore();
        });
    
        it("expands the data properties", () => {
            const el = fixture(html`<test-data-element></test-data-element>`);
            const ctor = el.constructor as DataElementCtor;
            expect(ctor.dataProperties["state"].statePath).toBe("test-data-element.state");
            el.restore();
        });
    
        it("expands the data properties with a stateId", () => {
            const el = fixture(html`<test-instance-data-element user-id="1234"></test-instance-data-element>`);
            const ctor = el.constructor as DataElementCtor;
            expect(ctor.dataProperties["user"].statePath).toBe("test-instance-data-element.user.1234");
            el.restore();
        });
    });


    describe("state initialization", () => {
        it("adds initial state to root state", () => {
            const el = fixture(html`<test-data-element></test-data-element>`);
            const state = RootState.get("test-data-element.state");
            expect(state).toStrictEqual({status: "default"});
            el.restore();
        });

        it("pulls state if already exists", () => {
            const state = {status:"pulled from root"};
            RootState.set("test-data-element.state", state);
            const el = fixture<TestDataElement>(html`<test-data-element></test-data-element>`);
            expect(el.state).toEqual(state);
            el.restore();
        });

        it("removes state after being removed from the DOM", () => {
            const el = fixture<TestDataElement>(html`<test-data-element></test-data-element>`);
            expect(el.state).toStrictEqual({status: "default"});
            const state = RootState.get("test-data-element.state");
            expect(state).toStrictEqual({status: "default"});
            el.restore();
            expect(RootState.get("test-data-element.state")).toBe(null);
        });

        it("removes state after multiple DOM insertions", () => {
            const el = fixture<TestDataElement>(html`<test-data-element></test-data-element>`);
            expect(el.state).toStrictEqual({status: "default"});
            expect(RootState.get("test-data-element.state")).toStrictEqual({status: "default"});
            const el2 = fixture<TestDataElement>(html`<test-data-element></test-data-element>`);
            expect(RootState.get("test-data-element.state")).toStrictEqual({status: "default"});
            el.restore();
            expect(RootState.get("test-data-element.state")).toStrictEqual({status: "default"});
            el2.restore();
            expect(RootState.get("test-data-element.state")).toBe(null);
        });

    });

    describe("state changes", () => {
        // test change makes it to root state

        // test change makes it to another element
    });

    describe("stateId", () => {
        // test stateId being used
    });
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
