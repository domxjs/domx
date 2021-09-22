import { describe, it, expect } from "@jest/globals";
import {fixture, html} from "@domx/testutils";
import { DataElement } from "../DataElement";
import { customDataElement, dataProperty } from "../decorators";
import { StateChange } from "@domx/statechange";
import {applyDataElementRdtLogging} from "../applyDataElementRdtLogging";
import { DevToolsExtension, DevToolsInstance } from "../rdtTypes";
import { RootState } from "../RootState";

describe("applyDataElementRdtLogging", () => {

    beforeEach(() => {
        RootState.init({});
    })

    afterEach(() => {
        DataElement.clearMiddleware();
        applyDataElementRdtLogging.reset();
        clearDevTools();
    });

    describe("logging", () => {
        it("does not error if called twice", () => {
            setDevTools();
            applyDataElementRdtLogging();
            expect(applyDataElementRdtLogging).not.toThrow();
        });

        it("does not error when there is no rdt", () => {
            const el = fixture<TestEl>(html`<test-el></test-el>`);
            expect(() => el.test1()).not.toThrow();
            el.restore();
        });

        it("logs events", () => {
            setDevTools();
            applyDataElementRdtLogging();
            const el = fixture<TestEl>(html`<test-el></test-el>`);
            el.test1();
            expect(MockDevToolsInstance.lastState).toStrictEqual({
                "test-el": {
                    "state": {
                        "status": "test1"
                    }
                }
            });
            el.restore();
        });
    
        it("does not log events if logChangeEvents is false", () => {
            setDevTools();
            applyDataElementRdtLogging({logChangeEvents:false});
            const el = fixture<TestEl>(html`<test-el></test-el>`);
            el.test1();
            expect(MockDevToolsInstance.lastState).toStrictEqual({
                "test-el": {
                    "state": {
                        "status": "unknown"
                    }
                }
            });
            el.restore();
        });
    
        it("logs changes from StateChange", () => {
            setDevTools();
            applyDataElementRdtLogging({logChangeEvents:false});
            const el = fixture<TestEl>(html`<test-el></test-el>`);
            el.testStateChange();
            expect(MockDevToolsInstance.lastState).toStrictEqual({
                "test-el": {
                    "state": {
                        "status": "testStateChange"
                    }
                }
            });
            el.restore();
        });

        it("skips logging on init", () => {
            setDevTools();
            applyDataElementRdtLogging();
            MockDevToolsInstance.lastError = "";
            const el = fixture<TestEl>(html`<test-el></test-el>`);
            el.test1();
            expect(el.state.status).toEqual("test1");
            MockDevToolsInstance.testInit();
            expect(MockDevToolsInstance.lastError).toBe("");
            el.restore();
        });

        it("logs RootState snapshots", () => {
            setDevTools();
            applyDataElementRdtLogging();
            RootState.snapshot("test-snapshot");
            expect(MockDevToolsInstance.lastAction).toBe("test-snapshot");
        })
    });
    
    describe("listener", () => {
        it("pushes data to a connected element", () => {
            setDevTools();
            applyDataElementRdtLogging();
            MockDevToolsInstance.lastError = "";
            const el = fixture<TestEl>(html`<test-el></test-el>`);
            expect(el.state.status).toEqual("unknown");
            MockDevToolsInstance.testJump({
                "test-el": {
                    "state": {
                        "status": "jumpedToState"
                    }
                }
            });
            expect(el.state.status).toEqual("jumpedToState");
            el.restore();
        });

        it("pushes data to multiple connected elements", () => {
            setDevTools();
            applyDataElementRdtLogging();
            MockDevToolsInstance.lastError = "";
            const el = fixture<TestEl>(html`<test-el></test-el>`);
            const el2 = fixture<TestSecondEl>(html`<test-second-el></test-second-el>`)
            expect(el.state.status).toEqual("unknown");
            expect(el2.user.userName).toEqual("unknown");
            MockDevToolsInstance.testJump({
                "test-el": {
                    "state": {
                        "status": "jumpedToState"
                    }
                },
                "test-second-el": {
                    "user": {
                        "userName": "joeuser"
                    }
                }
            });
            expect(el.state.status).toEqual("jumpedToState");
            expect(el2.user.userName).toEqual("joeuser");
            el.restore();
            el2.restore();
        });

        it("does not push data to a disconnected element", () => {
            setDevTools();
            applyDataElementRdtLogging();
            MockDevToolsInstance.lastError = "";
            const el = fixture<TestEl>(html`<test-el></test-el>`);
            expect(el.state.status).toEqual("unknown");
            el.remove();
            MockDevToolsInstance.testJump({
                "test-el": {
                    "state": {
                        "status": "jumpedToState"
                    }
                }
            });
            expect(el.state.status).toEqual("unknown");
            el.restore();
        });

        it("errors when skipping a state", async () => {
            setDevTools();
            applyDataElementRdtLogging();
            const el = fixture<TestEl>(html`<test-el></test-el>`);
            el.test1();
            expect(el.state.status).toStrictEqual("test1");
            expect(MockDevToolsInstance.lastError).toBe("");
            MockDevToolsInstance.testSkip();
            expect(MockDevToolsInstance.lastError).toBe("DataElement RDT logging does not support payload type: DISPATCH:TOGGLE_ACTION");
            el.restore();
        });
    });
});


@customDataElement("test-el")
class TestEl extends DataElement {
    state = {
        status: "unknown"
    };

    test1() {
        this.state = {
            ...this.state,
            status: "test1"
        };
        this.dispatchChange();
    }

    testStateChange() {
        StateChange.of(this)
            .next((state:any) => ({
                ...state,
                status: "testStateChange"
            }))
            .dispatch();
    }
}

@customDataElement("test-second-el")
class TestSecondEl extends DataElement {
    @dataProperty()
    user = {
        userName: "unknown"
    };
}







const setDevTools = () => {
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ = MockDevToolsExtension;
};


const clearDevTools = () => {
    delete (window as any).__REDUX_DEVTOOLS_EXTENSION__;
};



const MockDevToolsExtension:DevToolsExtension = {
    connect({name}:{name:string}={name:"window title"}) {
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
