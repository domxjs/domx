import { describe, it, expect } from "@jest/globals";
import {
    linkProp,
    linkChecked,
    linkSiblingProp,
    linkVal,
    setPropertyPath
  } from "./linkProp";


describe("linkProp", () => {

    it("has expected exports", () => {
        expect(linkProp).not.toBeNull();
        expect(linkChecked).not.toBeNull();
        expect(linkSiblingProp).not.toBeNull();
        expect(linkVal).not.toBeNull();
        expect(setPropertyPath).not.toBeNull();
    });
    
});