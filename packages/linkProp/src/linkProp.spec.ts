import { describe, it, expect } from "@jest/globals";
import {LitElement, property, customElement, html} from "lit-element";


import {
    linkProp,
    linkSiblingProp,
    linkVal,
    linkChecked,
    setPropertyPath
} from "./linkProp";

@customElement("test-element")
class TestElement extends LitElement {
    
    @property({ type: String})
    state = "initial state";

    render() {
        return html`
            <div id="testLinkProp" @state-changed="${linkProp(this, "state")}"></div>
            <div id="testSibling1" @foo-changed="${linkSiblingProp(this, "#testSibling2", "foo")}"></div>
            <div id="testSibling2"></div>
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
    })
});