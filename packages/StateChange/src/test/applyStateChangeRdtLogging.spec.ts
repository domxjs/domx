import { html, fixture } from "./testHelpers";
import {applyStateChangeRdtLogging} from "../applyStateChangeRdtLogging";
import {StateChange} from "../StateChange";
import {DevToolsExtension,DevToolsInstance} from "../rdtTypes";


describe("applyStateChangeRdtLogging", () => {
    it("does not error when there is no rdt", () => {
        applyStateChangeRdtLogging();
        const el = fixture(html`<test-state-change></test-state-change>`);
        expect(() => el.testSimple()).not.toThrow();
        el.restore();
        StateChange.clearMiddleware();
    });

    it("sends state to rdt on next", () => {
        applyStateChangeRdtLogging();
        setDevTools();
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testSimple();
        expect(MockDevToolsInstance.lastAction).toBe("TestStateChange.setBarTrue");
        expect(MockDevToolsInstance.lastState).toStrictEqual({foo:true, bar:true});
        el.restore();
        clearDevTools();
        StateChange.clearMiddleware();
    });

    it("sends state to rdt on tap", () => {
        applyStateChangeRdtLogging();
        setDevTools();
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testFunction();
        expect(MockDevToolsInstance.lastAction).toBe("TestStateChange.asyncTest");
        expect(MockDevToolsInstance.lastState).toStrictEqual({foo:false, bar:false});
        el.restore();
        clearDevTools();
        StateChange.clearMiddleware();
    });

    it("can jump to a state", async () => {
        applyStateChangeRdtLogging();
        setDevTools();
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testSimple();
        expect(el.state).toStrictEqual({foo:true, bar:true});
        MockDevToolsInstance.testJump({testJump: true});
        expect(el.state).toStrictEqual({testJump: true});
        el.restore();
        clearDevTools();
        StateChange.clearMiddleware();
    });

    it("errors when skipping a state", async () => {
        applyStateChangeRdtLogging();
        setDevTools();
        const el = fixture(html`<test-state-change></test-state-change>`);
        el.testSimple();
        expect(el.state).toStrictEqual({foo:true, bar:true});
        expect(MockDevToolsInstance.lastError).toBe("");
        MockDevToolsInstance.testSkip();
        expect(MockDevToolsInstance.lastError).toBe("StateChange rdt logging does not support payload type: TOGGLE_ACTION");
        el.restore();
        clearDevTools();
        StateChange.clearMiddleware();
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
        MockDevToolsInstance.listener({payload, state: toState});
    }

    static testSkip() {
        const payload = {type:"TOGGLE_ACTION"};
        MockDevToolsInstance.listener({payload});
    }
}