import { describe, it, expect } from "@jest/globals";
import {
    customDataElement,
    dataProperty,
    event
} from "../decorators";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(customDataElement).toBeDefined();
        expect(dataProperty).toBeDefined();
        expect(event).toBeDefined();
    });
});
