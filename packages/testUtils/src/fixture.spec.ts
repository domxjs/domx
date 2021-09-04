import { describe, it, expect } from "@jest/globals";
import {fixture, html} from "./fixture";


describe("testUtils", () => {

    it("creates an element", () => {
       const el = fixture(html`<div id="test-fixture"></div>`);
       expect(el.id).toBe("test-fixture");
       el.restore();
    });

    it("provides a remove method that removes the fixture", () => {
        const el = fixture(html`<div id="test-fixture"></div>`);
        expect(el.id).toBe("test-fixture");
        let fixtureDiv = document.querySelector("[fixture]");
        expect(fixtureDiv?.tagName).toBe("DIV");
        el.restore();
        fixtureDiv = document.querySelector("[fixture]");
        expect(fixtureDiv).toBe(null);
    });

    it("can by typed", () => {
        const el = fixture<HTMLInputElement>(html`<input type="text"/>`);
        expect(el.type).toBe("text");
        el.restore();
    });
});