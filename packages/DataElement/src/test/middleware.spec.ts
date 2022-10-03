import { describe, it, expect } from "@jest/globals";
import {
    applyDataElementRdtLogging,
    applyEventMapLogging,
    applyImmerToStateChange
} from "../middleware";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(applyDataElementRdtLogging).toBeDefined();
        expect(applyEventMapLogging).toBeDefined();
        expect(applyImmerToStateChange).toBeDefined();
    });
});
