import { describe, it, expect } from "@jest/globals";
import {Middleware} from "./Middleware";


describe("Middleware", () => {

    it("has a use function", () => {
        const mw = new Middleware();
        expect(mw.use).not.toBeNull();
    });
    

    describe("execute", () => {

        it("executes all functions when calling next", () => {
            const arr = ["it"];
            const mw = new Middleware();
            mw.use((next: Function) => (arg : any) => {
                arr.push("did", arg);
                return next(arg);
            });
            mw.use((next: Function) => (arg : any) => {
                arr.push("work", arg);
                return next(arg);
            });
            mw.executeWithArgs((arg : any) => {
                arr.push("meat", arg);
            }, [1]);
            console.log(arr.join(" "));
            
        })
        
    })


    /**
     *  * Tests to consider
     *  for execute what happens if you dont call next?
     */
});
