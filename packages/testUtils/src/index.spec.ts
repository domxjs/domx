import { describe, it, expect } from "@jest/globals";
import {
    fixture,
    html
} from "./index";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(fixture).toBeDefined();
        expect(html).toBeDefined();
    });
});
