import { describe, it, expect } from "@jest/globals";
import {
    compose,
    composeAsync,
    pipe,
    pipeAsync
} from "./index";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(compose).toBeDefined();
        expect(composeAsync).toBeDefined();
        expect(pipe).toBeDefined();
        expect(pipeAsync).toBeDefined();
    });
});
