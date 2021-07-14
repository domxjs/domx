import { describe, it, expect, jest } from "@jest/globals";
import {Logger} from "./Logger";


describe("Logger", () => {

    it("can log to the console", () => {
        const spy = jest.spyOn(console, "log");
        Logger.log({}, "log", "hello world");
        expect(spy).toHaveBeenCalledWith("hello world");
        spy.mockRestore();
    });
    
});
