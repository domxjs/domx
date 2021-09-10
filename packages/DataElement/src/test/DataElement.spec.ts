import { describe, it, expect } from "@jest/globals";
import { fixture, html} from "@domx/testutils/fixture";
import { RootState } from "../RootState";
import {
    customDataElement,
    DataElement,
    DataElementCtor,
    dataProperty
} from "../DataElement";
import { state } from "lit-element";


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
            const el = fixture<DataElement>(html`<test-data-element></test-data-element>`);
            expect(el.__dataPropertyMetaData["state"].statePath).toBe("test-data-element.state");
            el.restore();
        });
    
        it("expands the data properties with a stateId", () => {
            const el = fixture<DataElement>(html`<test-instance-data-element user-id="1234"></test-instance-data-element>`);
            expect(el.__dataPropertyMetaData["user"].statePath).toBe("test-instance-data-element.user.1234");
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
        it("updates root state after changes occur", () => {
            const el = fixture<TestDataElement>(html`<test-data-element></test-data-element>`);
            expect(el.state).toStrictEqual({status: "default"});
            expect(RootState.get("test-data-element.state")).toStrictEqual({status: "default"});
            el.state.status = "updated";
            el.dispatchEvent(new CustomEvent("state-changed"));
            expect(RootState.get("test-data-element.state")).toStrictEqual({status: "updated"});
            el.restore();
        });

        it("updates root state after changes occur", () => {
            const el = fixture<TestDataElement>(html`<test-data-element></test-data-element>`);
            const el2 = fixture<TestDataElement>(html`<test-data-element></test-data-element>`);
            expect(el.state).toStrictEqual({status: "default"});
            expect(RootState.get("test-data-element.state")).toStrictEqual({status: "default"});
            el.state.status = "updated";
            el.dispatchEvent(new CustomEvent("state-changed"));
            expect(el2.state).toStrictEqual({status: "updated"});
            el.restore();
            el2.restore();
        });
    });

    describe("stateId", () => {
        it("uses the stateId", () => {
            const el = fixture<TestDataElement>(html`
                <test-instance-data-element user-id="1234"></test-instance-data-element>
            `);
            expect(RootState.get("test-instance-data-element.user.1234"))
                .toStrictEqual({userName: "unknown"});
            el.restore();
        });
    });

    describe("decorators", () => {
        it("supports a dataProperty decorator", () => {
            const el = fixture<TestDecorators>(html`<test-decorators></test-decorators>`);
            const ctor = el.constructor as DataElementCtor;
            expect(ctor.dataProperties.user.changeEvent).toBe("user-changed");
            expect(ctor.dataProperties.data.changeEvent).toBe("data-did-change");
            el.restore();
        });

        it("supports setting the stateIdProperty", () => {
            const el = fixture<TestDecorators>(html`<test-decorators></test-decorators>`);
            const ctor = el.constructor as DataElementCtor;
            expect(el.__dataPropertyMetaData.user.statePath).toBe("test-decorators.user.1234");
            el.restore();
        });
    });

    describe("stateId change; refreshState", () => {
        it("changes the state tree appropriately", () => {
            const el = fixture<TestInstanceDataElement>(html`
                <test-instance-data-element user-id="1234"></test-instance-data-element>
            `);
            expect(RootState.get("test-instance-data-element.user.1234"))
                .toStrictEqual({userName: "unknown"});
            el.testChange();
            expect(RootState.get("test-instance-data-element.user.1234"))
                .toStrictEqual({userName: "joeuser"});
            el.setAttribute("user-id", "9876");
            expect(RootState.get("test-instance-data-element.user.1234"))
                .toBe(null)
            expect(RootState.get("test-instance-data-element.user.9876"))
                .toStrictEqual({userName: "unknown"});
        });
    });

    describe("dispatchChange", () => {
        it("dispatches state-change by default", () => {
            const el = fixture<TestDataElement>(html`<test-data-element></test-data-element>`)
            let message = "";
            el.addEventListener("state-changed", (event: Event) => {
                message = "event dispatched";
            });
            el.testDispatch();
            expect(message).toBe("event dispatched");
        });

        it("dispatches the correct change event if configured", () => {
            const el = fixture<TestInstanceDataElement>(html`<test-instance-data-element></test-instance-data-element>`)
            let message = "";
            el.addEventListener("user-changed", (event: Event) => {
                message = "event dispatched";
            });
            el.testDispatch();
            expect(message).toBe("event dispatched");
        });
    });
});


@customDataElement("test-data-element")
class TestDataElement extends DataElement {
    state = {
        status: "default"
    };

    testDispatch() {
        this.dispatchChange();
    }
}

@customDataElement("test-instance-data-element")
class TestInstanceDataElement extends DataElement {
    static defaultState = { userName: "unknown" };
    static get observedAttributes() { return ["user-id"]; }
    static stateIdProperty = "userId";
    static dataProperties = {
        "user": {changeEvent:"user-changed"}
    }

    get userId():string { return this.getAttribute("user-id") || ""; }
    set userId(stateId:string) { this.setAttribute("user-id", stateId); }

    user = TestInstanceDataElement.defaultState;

    attributeChangedCallback(name:string, oldValue:string, newValue:string) {
        if (name === "user-id") {
            this.refreshState({
                user: TestInstanceDataElement.defaultState
            });
        }
    }

    testChange() {
        this.user = {
            ...this.user,
            userName: "joeuser"
        };
        this.dispatchChange("user");
    }

    testDispatch() {
        this.dispatchChange("user");
    }
}

@customDataElement("test-decorators", {
    stateIdProperty: "dataId"
})
class TestDecorators extends DataElement {

    @dataProperty()
    user = { userName: "unknown" }

    @dataProperty({changeEvent:"data-did-change"})
    data = { test: "data"}

    dataId = "1234";
}
