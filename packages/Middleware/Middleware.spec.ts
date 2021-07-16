import { describe, it, expect } from "@jest/globals";
import {Middleware} from "./Middleware";


describe("Middleware", () => {

    it("has a use function", () => {
        const mw = new Middleware();
        expect(mw.use).not.toBeNull();
    });

    it("can execute with arguments", () => {
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
        const ret = mw.execute((arg : any) => {
            arr.push("meet", arg);
            return "return";
        }, [1]);
        arr.push(ret);
        const testStr = arr.join(" ");
        expect(testStr).toBe("it did 1 work 1 meet 1 return");      
    });
    

    it("can map then execute with arguments", () => {
        const arr = ["it"];
        const mw = new Middleware();
        mw.use((mapped: string) => (next: Function) => (arg : any) => {
            arr.push("did", mapped, arg);
            return next(arg);
        });
        mw.use((mapped: string) => (next: Function) => (arg : any) => {
            arr.push("work", mapped, arg);
            return next(arg);
        });
        const ret = mw.mapThenExecute("mapped", (arg : any) => {
            arr.push("meet", arg);
            return "return";
        }, [1]);
        arr.push(ret);
        const testStr = arr.join(" ");
        console.log(testStr);
        expect(testStr).toBe("it did mapped 1 work mapped 1 meet 1 return");
    });
});
