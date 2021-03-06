import { describe, it, expect, jest } from "@jest/globals";
import {Logger, loggerConfig } from "../Logger";


@loggerConfig({
    level: "debug"
})
class TestLogger extends HTMLElement{
    testLog() {
        Logger.log(this, "debug", "log from test logger");
    }
    testGroupEnd() {
        Logger.log(this, "groupEnd");
    }
}
customElements.define("test-logger", TestLogger);



class OnlyThisTestLogger extends HTMLElement{
    testLog() {
        Logger.log(this, "debug", "log from only this test logger");
    }
}
customElements.define("only-this-test-logger", OnlyThisTestLogger);



describe("Logger", () => {

    it("can log to the console", () => {
        const spy = jest.spyOn(console, "debug").mockImplementation(() => {});
        //console.log = jest.fn();
        Logger.log(new TestLogger(), "debug", "hello world");
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith("hello world");
        spy.mockRestore();
    });

    describe("loggerConfig", () => {
        it("adds a logger config", () => {
            const testLogger = new TestLogger();
            //@ts-ignore
            expect(testLogger.constructor.__loggerConfig.level).toBe("debug");
        });

        it("does log if level matches", () => {
            const spy = jest.spyOn(console, "debug").mockImplementation(() => {});
            const testLogger = new TestLogger();
            testLogger.testLog();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith("log from test logger");
            spy.mockRestore();    
        });
    
        it("logs only on configured level if level does not match", () => {
            const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
            const spy = jest.spyOn(console, "log").mockImplementation(() => {});
            const testLogger = new TestLogger();
            testLogger.testLog();
            expect(spy).toHaveBeenCalledTimes(0);
            expect(debugSpy).toHaveBeenCalledTimes(1);
            expect(debugSpy).toHaveBeenCalledWith("log from test logger");
            spy.mockRestore();
            debugSpy.mockRestore();
        });

        it("does not log if a config level is set and the log level is groupEnd", () => {
            const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
            const testLogger = new TestLogger();
            testLogger.testGroupEnd();
            expect(debugSpy).toHaveBeenCalledTimes(0);
            debugSpy.mockRestore();
        });
    
        it("respects onlyThis", () => {
            const spy = jest.spyOn(console, "debug").mockImplementation(() => {});
            const warnSpay = jest.spyOn(console, "warn").mockImplementation(() => {});
            const onlyThisTestLogger = new OnlyThisTestLogger();
            
            const testLogger = new TestLogger();
            testLogger.testLog();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith("log from test logger");
            //@ts-ignore
            loggerConfig({onlyThis: true})(onlyThisTestLogger);
            testLogger.testLog();
            expect(spy).toHaveBeenCalledTimes(1);
            spy.mockRestore();
            warnSpay.mockRestore();
        });
    });
});
