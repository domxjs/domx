import { describe, it, expect } from "@jest/globals";
import {
    loggerConfig,
    Logger,
    Middleware
} from "../index";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(loggerConfig).toBeDefined();
        expect(Logger).toBeDefined();
        expect(Middleware).toBeDefined();
    });
});
