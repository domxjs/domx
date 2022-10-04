import { describe, it, expect } from "@jest/globals";
import {
    Router    
} from "../index";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(Router).toBeDefined();
    });
});
