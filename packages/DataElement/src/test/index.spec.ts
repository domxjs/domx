import { describe, it, expect } from "@jest/globals";
import {
    DataElement,
    StateChange,
    applyImmerToStateChange,
    customDataElement,
    customDataElements,
    dataProperty,
    event
} from "../index";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(DataElement).toBeDefined();
        expect(StateChange).toBeDefined();
        expect(applyImmerToStateChange).toBeDefined();
        expect(customDataElement).toBeDefined();
        expect(customDataElements).toBeDefined();
        expect(dataProperty).toBeDefined();
        expect(event).toBeDefined();
    });
});
