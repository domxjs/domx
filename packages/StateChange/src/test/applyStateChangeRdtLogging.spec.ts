import { html, fixture } from "./testHelpers";
import {applyStateChangeRdtLogging} from "../applyStateChangeRdtLogging";
import {StateChange} from "../StateChange";
import {DevToolsExtension,DevToolsInstance} from "../rdtTypes";


describe("applyStateChangeRdtLogging", () => {
    beforeEach(() => {
        applyStateChangeRdtLogging();
    });

    afterEach(() => {
        clearDevTools();
        StateChange.clearMiddleware();
        applyStateChangeRdtLogging.reset();
    });


    it("does not error when there is no rdt", () => {
        const el = fixture(html`<test-state-change></test-state-change>`);
        expect(() => el.testSimple()).not.toThrow();
        el.restore();
    });

    it("sends state to rdt on next", () => {
        setDevTools();
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testSimple();
        expect(MockDevToolsInstance.lastAction).toBe("TestStateChange.setBar()");
        expect(MockDevToolsInstance.lastState).toStrictEqual({foo:true, bar:true});
        el.restore();
    });

    it("sends state to rdt on tap", async () => {
        setDevTools();
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testFunction();
        await setTimeout(() => {});
        expect(MockDevToolsInstance.lastAction).toBe("TestStateChange.asyncTest(setBarTrue)");
        expect(MockDevToolsInstance.lastState).toStrictEqual({foo:true, bar:true});
        el.restore();
    });

    it("can jump to a state", async () => {
        setDevTools();
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testSimple();
        expect(el.state).toStrictEqual({foo:true, bar:true});
        MockDevToolsInstance.testJump({testJump: true});
        expect(el.state).toStrictEqual({testJump: true});
        el.restore();
    });

    it("errors when skipping a state", async () => {
        setDevTools();
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testSimple();
        expect(el.state).toStrictEqual({foo:true, bar:true});
        expect(MockDevToolsInstance.lastError).toBe("");
        MockDevToolsInstance.testSkip();
        expect(MockDevToolsInstance.lastError).toBe("StateChange RDT logging does not support payload type: DISPATCH:TOGGLE_ACTION");
        el.restore();
    });

    it("warns if called twice", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
        expect(warnSpy).toHaveBeenCalledTimes(0);
        applyStateChangeRdtLogging();
        expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it("skips logging on init", () => {
        setDevTools();
        MockDevToolsInstance.lastError = "";
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testSimple();
        expect(el.state).toStrictEqual({foo:true, bar:true});
        MockDevToolsInstance.testInit();
        expect(MockDevToolsInstance.lastError).toBe("");
        el.restore();
    });
});


const setDevTools = () => {
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ = MockDevToolsExtension;
};


const clearDevTools = () => {
    delete (window as any).__REDUX_DEVTOOLS_EXTENSION__;
};



const MockDevToolsExtension:DevToolsExtension = {
    connect({name}:{name:string}) {
        return new MockDevToolsInstance(name);
    }
};


class MockDevToolsInstance implements DevToolsInstance {
    name:string;

    static listener:any = null;

    static lastAction:string = "";
    static lastState:any = null;
    static lastError:string = "";

    constructor(name:string) {
        this.name = name;
    }

    init(state: any): void {
        MockDevToolsInstance.lastState = state;
    }

    subscribe(listener: Function): void {
        MockDevToolsInstance.listener = listener;
    }

    unsubscribe(): void {
        MockDevToolsInstance.listener = null;
    }

    send(action: string, state: any): void {
        MockDevToolsInstance.lastAction = action;
        MockDevToolsInstance.lastState = state;
    }

    error(message: string): void {
        MockDevToolsInstance.lastError = message;
    }

    static testJump(toState:any) {
        const payload = {type: "JUMP_TO_ACTION"};
        MockDevToolsInstance.listener({type: "DISPATCH", payload, state: JSON.stringify(toState)});
    }

    static testSkip() {
        const payload = {type:"TOGGLE_ACTION"};
        MockDevToolsInstance.listener({type:"DISPATCH", payload});
    }

    static testInit() {
        const payload = {type:"ANY"};
        MockDevToolsInstance.listener({type:"START", payload});
    }
}