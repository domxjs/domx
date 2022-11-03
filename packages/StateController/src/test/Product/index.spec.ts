import { describe, it, expect } from "@jest/globals";
import {
    Product,
    produce
} from "../../Product/index";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(Product).toBeDefined();
        expect(produce).toBeDefined();
    });
});
