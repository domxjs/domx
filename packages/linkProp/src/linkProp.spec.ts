import { describe, it, expect } from "@jest/globals";
import { LitElement, html } from "lit";
import { property, customElement } from "lit/decorators";

import {
    linkProp,
    linkSiblingProp,
    linkVal,
    linkChecked,
    setPropertyPath
} from "./linkProp";

@customElement("test-element")
class TestElement extends LitElement {
    
    @property({type: String})
    state = "initial state";

    @property({type: String})
    valueProperty = "initial value";

    @property({type: Boolean})
    checkedProperty = false;

    @property({type: Object})
    propertyPathObject = {
        child1: {
            child2: "initial value"
        }
    };

    render() {
        return html`
            <div id="testLinkProp" @state-changed="${linkProp(this, "state")}"></div>
            <div id="testSibling1" @foo-changed="${linkSiblingProp(this, "#testSibling2", "foo")}"></div>
            <div id="testSibling2"></div>
            <input id="testLinkVal" type="text" value="${this.valueProperty}"
                @change="${linkVal(this, "valueProperty")}">
            <input id="testLinkChecked" type="checkbox" ?checked="${this.checkedProperty}"
                @change="${linkChecked(this, "checkedProperty")}">
        `;
    }
}


describe("linkProp", () => {

    it("has expected exports", () => {
        expect(linkProp).not.toBeNull();
        expect(linkChecked).not.toBeNull();
        expect(linkSiblingProp).not.toBeNull();
        expect(linkVal).not.toBeNull();
        expect(setPropertyPath).not.toBeNull();
    });

    it("links a child property to the parent on change using linkProp", async () => {
        const testElement = document.createElement("test-element") as TestElement;
        document.body.appendChild(testElement);
        await testElement.updateComplete;
        const testDiv = testElement.shadowRoot?.querySelector("#testLinkProp");
        //@ts-ignore
        testDiv.state = "updated state!";
        expect(testElement.state).toEqual("initial state");
        testDiv?.dispatchEvent(new CustomEvent("state-changed"));
        expect(testElement.state).toEqual("updated state!");
    });

    it("links two child properties of a parent on change using linkProp", async () => {
        const testElement = document.createElement("test-element") as TestElement;
        document.body.appendChild(testElement);
        await testElement.updateComplete;
        const testSibling1 = testElement.shadowRoot?.querySelector("#testSibling1");
        const testSibling2 = testElement.shadowRoot?.querySelector("#testSibling2");
        //@ts-ignore
        testSibling1.foo = "changed foo!";
        //@ts-ignore
        expect(testSibling2.foo).toBeUndefined();
        testSibling1?.dispatchEvent(new CustomEvent("foo-changed"));
        //@ts-ignore
        expect(testSibling2.foo).toEqual("changed foo!");
    });

    it("updates the value property using linkVal", async () => {
        const testElement = document.createElement("test-element") as TestElement;
        document.body.appendChild(testElement);
        await testElement.updateComplete;
        const testLinkVal = testElement.shadowRoot?.querySelector("#testLinkVal") as HTMLInputElement;
        testLinkVal.setAttribute("value", "updated value!");
        expect(testLinkVal.value).toEqual("updated value!");
        expect(testElement.valueProperty).toEqual("initial value");
        testLinkVal.dispatchEvent(new Event("change"));
        expect(testElement.valueProperty).toEqual("updated value!");
    });

    it("updates the checked property using linkChecked", async () => {
        const testElement = document.createElement("test-element") as TestElement;
        document.body.appendChild(testElement);
        await testElement.updateComplete;
        const testLinkChecked = testElement.shadowRoot?.querySelector("#testLinkChecked") as HTMLInputElement;
        testLinkChecked.checked = true;
        expect(testElement.checkedProperty).toBe(false);
        testLinkChecked.dispatchEvent(new Event("change"));
        expect(testElement.checkedProperty).toBe(true);
    });

    it("can set a deep property path with setPropertyPath", () => {
        const testElement = document.createElement("test-element") as TestElement;
        document.body.appendChild(testElement);     
        expect(testElement.propertyPathObject.child1.child2).toEqual("initial value");
        setPropertyPath(testElement, "propertyPathObject.child1.child2", "updated!");
        expect(testElement.propertyPathObject.child1.child2).toEqual("updated!");
    });

    it("can set a middle property path with setPropertyPath", () => {
        const testElement = document.createElement("test-element") as TestElement;
        document.body.appendChild(testElement);        
        expect(testElement.propertyPathObject.child1.child2).toEqual("initial value");
        setPropertyPath(testElement, "propertyPathObject.child1", {child2: "updated!"});
        expect(testElement.propertyPathObject.child1.child2).toEqual("updated!");
    })
});