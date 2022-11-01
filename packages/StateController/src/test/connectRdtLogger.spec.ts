import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StateController, RootState } from "../StateController";
import { fixture } from "@domx/testutils/fixture";
import { trackState } from "../decorators";
import { connectRdtLogger, DevToolsExtension, DevToolsInstance } from "../connectRdtLogger";
import { Product } from "../Product";


describe("connectRdtLogger", () => {
    it("can apply rdt logging", () => {
        connectRdtLogger();
    })
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
            .requestUpdate("testProduct");
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
