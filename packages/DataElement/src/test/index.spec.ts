import { describe, it, expect } from "@jest/globals";
import {
    DataElement,
    StateChange,
    customDataElements
} from "../index";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(DataElement).toBeDefined();
        expect(StateChange).toBeDefined();
        expect(customDataElements).toBeDefined();
    });
});
