import { describe, it, expect } from "@jest/globals";
import {
    applyDataElementRdtLogging,
} from "../middleware";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(applyDataElementRdtLogging).toBeDefined();
    });
});
