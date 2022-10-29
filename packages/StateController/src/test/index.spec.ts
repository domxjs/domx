import { describe, it, expect } from "@jest/globals";
import {
    StateController,
    RootState,
    RootStateChangeEvent,
    hostEvent,
    windowEvent,
    trackState    
} from "../index";

describe("DataElement index", () => {
    it("exports the correct files", () => {
        expect(StateController).toBeDefined();
        expect(RootState).toBeDefined();
        expect(RootStateChangeEvent).toBeDefined();
        expect(hostEvent).toBeDefined();
        expect(windowEvent).toBeDefined();
        expect(trackState).toBeDefined();
    });
});
