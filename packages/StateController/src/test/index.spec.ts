import { describe, it, expect } from "@jest/globals";
import {
    StateController,
    RootState,
    hostEvent,
    windowEvent,
    stateProperty,
    Product,
    connectRdtLogger
} from "../index";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(StateController).toBeDefined();
        expect(RootState).toBeDefined();
        expect(hostEvent).toBeDefined();
        expect(windowEvent).toBeDefined();
        expect(stateProperty).toBeDefined();
        expect(Product).toBeDefined();
        expect(connectRdtLogger).toBeDefined();
    });
});
