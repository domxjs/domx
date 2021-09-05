import { describe, it, expect } from "@jest/globals";
import { fixture, html} from "@domx/testutils/fixture";
import {
    customDataElement,
    DataElement
} from "../DataElement";


describe("DataElement", () => {
    it("it can define an element", () => {
        const el = fixture(html`<test-data-element></test-data-element>`)
        expect(el.tagName).toBe("TEST-DATA-ELEMENT");
    });

    it("it adds the __elementName", () => {
        const el = fixture(html`<test-data-element></test-data-element>`)
        //@ts-ignore TS2339 checking dynamic property
        expect(el.constructor.__elementName).toBe("test-data-element");
    });
});


@customDataElement("test-data-element")
class TestDataElement extends DataElement {

}
