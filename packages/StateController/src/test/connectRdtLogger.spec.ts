import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StateController, RootState } from "../StateController";
import { fixture } from "@domx/testutils/fixture";
import { trackState } from "../decorators";
import { connectRdtLogger, DevToolsExtension, DevToolsInstance, RdtLogger } from "../connectRdtLogger";
import { Product } from "../Product";


describe("connectRdtLogger", () => {

    let rdtLogger:RdtLogger|null = null;

    beforeEach(() => {
        RootState.push({});
    })

    afterEach(() => {
        rdtLogger?.disconnect();
        clearDevTools();
    });


    describe("logging", () => {
        it("does not error if called twice", () => {
            setDevTools();
            rdtLogger = connectRdtLogger();
            expect(connectRdtLogger).not.toThrow();
        });

        it("returns the logger if calling connect", () => {
            setDevTools();
            rdtLogger = connectRdtLogger();
            const rdtLogger2 = rdtLogger?.connect();
            expect(rdtLogger).toBe(rdtLogger2);
        });

        it("does not error if calling disconnect multiple times", () => {
            setDevTools();
            rdtLogger = connectRdtLogger();
            rdtLogger?.disconnect();
            expect(rdtLogger?.isConnected).toBe(false);
        });

        it("does not error when there is no rdt", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(() => el.testState.test1()).not.toThrow();
            el.restore();
        });

        it("logs events", () => {
            setDevTools();
            rdtLogger = connectRdtLogger();
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            el.testState.test1();
            expect(MockDevToolsInstance.lastState).toStrictEqual({
                "TestController1.state": {
                    "status": "test1"
                }
            });
            el.restore();
        });

        it("logs changes when using Product", () => {
            setDevTools();
            rdtLogger = connectRdtLogger();
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            el.testState.testProduct();
            expect(MockDevToolsInstance.lastState).toStrictEqual({
                "TestController1.state": {
                    "status": "testStateChange"
                }
            });
            el.restore();
        });

        it("skips logging on init", () => {
            setDevTools();
            rdtLogger = connectRdtLogger();
            MockDevToolsInstance.lastError = "";
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            el.testState.test1();
            expect(el.testState.state.status).toEqual("test1");
            MockDevToolsInstance.testInit();
            expect(MockDevToolsInstance.lastError).toBe("");
            el.restore();
        });
    });

    describe("listener", () => {
        it("pushes data to a connected element", () => {
            setDevTools();
            rdtLogger = connectRdtLogger();
            MockDevToolsInstance.lastError = "";
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(el.testState.state.status).toEqual("unknown");
            MockDevToolsInstance.testJump({
                "TestController1.state": {
                    "status": "jumpedToState"
                }
            });
            expect(el.testState.state.status).toEqual("jumpedToState");
            el.restore();
        });

        it("pushes data to multiple connected elements", () => {
            setDevTools();
            rdtLogger = connectRdtLogger();
            MockDevToolsInstance.lastError = "";
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            const el2 = fixture<TestElement2>(html`<test-element-2></test-element-2>`);
            expect(el.testState.state.status).toEqual("unknown");
            expect(el2.testState.user.userName).toEqual("unknown");
            MockDevToolsInstance.testJump({
                "TestController1.state": {
                    "status": "jumpedToState"
                },
                "TestController2.user": {
                    "userName": "joeuser"
                }
            });
            expect(el.testState.state.status).toEqual("jumpedToState");
            expect(el2.testState.user.userName).toEqual("joeuser");
            el.restore();
            el2.restore();
        });

        // jch - here
        it("does not push data to a disconnected element", () => {
            setDevTools();
            rdtLogger = connectRdtLogger();
            MockDevToolsInstance.lastError = "";
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(el.testState.state.status).toEqual("unknown");
            el.remove();
            MockDevToolsInstance.testJump({
                "TestController1.state": {
                    "status": "jumpedToState"
                }
            });
            expect(el.testState.state.status).toEqual("unknown");
            el.restore();
        });

        it("errors when skipping a state", async () => {
            setDevTools();
            rdtLogger = connectRdtLogger();
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            el.testState.test1();
            expect(el.testState.state.status).toStrictEqual("test1");
            expect(MockDevToolsInstance.lastError).toBe("");
            MockDevToolsInstance.testSkip();
            expect(MockDevToolsInstance.lastError).toBe("DataElement RDT logging does not support payload type: DISPATCH:TOGGLE_ACTION");
            el.restore();
        });
    });

    it("returns null when no rdt logger", () => {
        rdtLogger = connectRdtLogger();
        expect(rdtLogger).toBe(null);
    });
});



@customElement("test-element-1")
class TestElement1 extends LitElement {
    testState = new TestController1(this);
}

class TestController1 extends StateController {
    @trackState()
    state = { status: "unknown" };

    test1() {
        this.state = {
            ...this.state,
            status: "test1"
        };
        this.requestUpdate("test1");
    }

    testProduct() {
        Product.of(this, "state")
            .next((state:any) => ({
                ...state,
                status: "testStateChange"
            }))
            .requestUpdate(new Event("test-event"));
    }
}

@customElement("test-element-2")
class TestElement2 extends LitElement {
    testState = new TestController2(this);
    
}

class TestController2 extends StateController {
    @trackState()
    user =  { userName: "unknown" };
}



const setDevTools = () => {
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ = MockDevToolsExtension;
};


const clearDevTools = () => {
    delete (window as any).__REDUX_DEVTOOLS_EXTENSION__;
};



const MockDevToolsExtension:DevToolsExtension = {
    connect({name}:{name?:string}={name:"window title"}) {
        return new MockDevToolsInstance(name);
    }
};


class MockDevToolsInstance implements DevToolsInstance {
    name?:string;

    static listener:any = null;

    static lastAction:string = "";
    static lastState:any = null;
    static lastError:string = "";

    constructor(name?:string) {
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
