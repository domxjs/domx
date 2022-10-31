import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StateController, RootState } from "../StateController";
import { trackState, windowEvent, hostEvent } from "../decorators";
import { fixture } from "@domx/testutils/fixture";


describe("StateController/decorators", () => {
    
    describe("trackState", () => {
        it("it adds a state property to the controller", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(el.testState instanceof StateController).toBe(true);
            expect(el.testState.stateProperties[0]).toBe("state");
            el.restore();
        });
    });

    describe("windowEvent", () => {
        it("it handles the event", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(el.testState.state.foo).toBe("bar");
            el.testWindowEvent("new foo value");
            expect(el.testState.state.foo).toBe("new foo value");
            el.restore();
        });

        it("removes the event handler when disconnected", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(el.testState.state.foo).toBe("bar");
            el.testWindowEvent("new foo value");
            expect(el.testState.state.foo).toBe("new foo value");
            el.restore();
            el.testWindowEvent("new foo value 2");
            expect(el.testState.state.foo).toBe("new foo value");
        });
    });

    describe("hostEvent", () => {
        it("it handles the event", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(el.testState.state.foo).toBe("bar");
            el.testHostEvent("new foo value");
            expect(el.testState.state.foo).toBe("new foo value");
            el.restore();
        });

        it("removes the event handler when disconnected", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(el.testState.state.foo).toBe("bar");
            el.testHostEvent("new foo value");
            expect(el.testState.state.foo).toBe("new foo value");
            el.restore();
            el.testWindowEvent("new foo value 2");
            expect(el.testState.state.foo).toBe("new foo value");
        });
    });
    
});

// jch StateController tasks
// Document code
// Product.of()
// RDT logging
//  -> need a method to push changes to root state without firing the RootState Changed method
//  -> similar to RootState.change


interface ITestControllerStateData {
    foo: string
}

class TestWindowEvent extends Event {
    static eventType = "test-window-event";
    testValue:string;
    constructor(testValue:string) {
        super(TestWindowEvent.eventType, { bubbles: true, composed: true});
        this.testValue = testValue;
    }
}

class TestHostEvent extends Event {
    static eventType = "test-host-event";
    testValue:string;
    constructor(testValue:string) {
        super(TestHostEvent.eventType);
        this.testValue = testValue;
    }
}

class TestStateController1 extends StateController {
    static defaultState:ITestControllerStateData = { foo: "bar"};

    @trackState()
    state:ITestControllerStateData = {...TestStateController1.defaultState};

    @windowEvent(TestWindowEvent)
    testWindowEvent(event:TestWindowEvent) {
        this.state.foo = event.testValue;
    }

    @hostEvent(TestHostEvent)
    testHostEvent(event:TestHostEvent) {
        this.state.foo = event.testValue;
    }
}

@customElement("test-element-1")
class TestElement1 extends LitElement {
    public testState = new TestStateController1(this);

    public testWindowEvent(testValue:string) {
        this.dispatchEvent(new TestWindowEvent(testValue));
    }

    public testHostEvent(testValue:string) {
        this.dispatchEvent(new TestHostEvent(testValue));
    }
}

