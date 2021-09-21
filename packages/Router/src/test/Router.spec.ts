import { describe, it, expect, jest } from "@jest/globals";
import { Router } from "../Router";


describe("Router", () => {
    afterEach(() => {
        Router.root = "/";
    });

    it("exists", () => {
        expect(Router).toBeDefined();
    })

    describe("root", () => {
        it("can be set", () => {
            Router.root = "/root/path";
            expect(Router.root).toBe("/root/path");
        });

        it("throws an error if set twice after a reset", () => {
            Router.root = "/root/path";
            const setRootAgain = () => Router.root = "/second/path";
            expect(setRootAgain).toThrow("Router.root has already been set.");
            expect(Router.root).toBe("/root/path");
        });
    });
    
    // jch Router tests
    // outside links not handled
    // browser back button
    // replace-state on links
});