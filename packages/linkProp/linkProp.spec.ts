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

    it("does something", () => {
        // const testElement = new TestElement();
        const testElement = document.createElement("test-element") as TestElement;
        document.body.appendChild(testElement);
        const testDiv = testElement.shadowRoot?.querySelector("#testLinkProp")
        console.log("TESTDIV", document.body.innerHTML);
        //@ts-ignore
        testDiv.state = "updated state!";
        expect(testElement.state).toEqual("initial state");
        testDiv?.dispatchEvent(new CustomEvent("state-changed"));
        expect(testElement.state).toEqual("updated state!");

    })
});