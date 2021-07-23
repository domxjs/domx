import { describe, test, expect } from "@jest/globals";
import { EventMap } from "./EventMap";

describe.skip("EventMap", () => {

    test("it is true", () => {
        expect(true).toBe(true);
    });

    test("Event map is not null", () => {
        expect(EventMap).toBeDefined();
    })
})