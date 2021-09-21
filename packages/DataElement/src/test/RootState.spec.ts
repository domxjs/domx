import { describe, it, expect } from "@jest/globals";
import {RootState} from "../RootState";

describe("RootState", () => {

    afterEach(() => {
        RootState.init({});
    });

    describe("set", () => {
        it("it can set at the first level", () => {
            RootState.set("test-state", {state:{test:"value"}});
            expect(RootState.current).toStrictEqual({
                "test-state": {
                    state: {test:"value"}
                }
            });
        });
    
        it("can set a second level", () => {
            RootState.set("test-state.state", {test:"value"});
            expect(RootState.current).toStrictEqual({
                "test-state": {
                    state: {test:"value"}
                }
            });
        });
    
        it("can set a third level", () => {
            RootState.set("test-state.state.1234", {test:"value"});
            expect(RootState.current).toStrictEqual({
                "test-state": {
                    state: {
                        "1234": {test:"value"}
                    }
                }
            });
        });

        it("can update existing state", () => {
            const state = {test:"value"};
            const state2 = {test: "value2"};
            RootState.set("test-state.state.1234", state);
            expect(RootState.get("test-state.state.1234")).toEqual(state);
            RootState.set("test-state.state.1234", state2);
            expect(RootState.get("test-state.state.1234")).toEqual(state2);
        });
    });

    describe("get", () => {
        it("can get a second level", () => {
            const state = {test:"value"};
            RootState.set("test-state.state", state);
            const retrievedState = RootState.get("test-state.state");
            expect(state).toEqual(retrievedState);
        });

        it("can get a third level", () => {
            const state = {test:"value"};
            RootState.set("test-state.state.1234", state);
            expect(RootState.get("test-state.state.1234")).toEqual(state);
        });

        it("does not keep the original object in state", () => {
            const state = {test:"value"};
            RootState.set("test-state.state.1234", state);
            expect(RootState.get("test-state.state.1234")).toEqual(state);
            state.test = "value2";
            expect(RootState.get("test-state.state.1234")).not.toEqual(state);
        });
    });

    describe("delete", () => {
        it("can delete a second level", () => {
            const state = {test:"value"};
            RootState.set("test-state.state", state);
            const retrievedState = RootState.get("test-state.state");
            expect(state).toEqual(retrievedState);
            RootState.delete("test-state.state");
            expect(RootState.get("test-state.state")).toBe(null);
        });

        it("can delete a third level", () => {
            const state = {test:"value"};
            RootState.set("test-state.state.123", state);
            const retrievedState = RootState.get("test-state.state.123");
            expect(state).toEqual(retrievedState);
            RootState.delete("test-state.state.123");
            expect(RootState.get("test-state.state.123")).toBe(null);
        });
    });

    // jch add test for RootState.snapshot
});
