import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StateController, RootState } from "../StateController";
import { stateProperty, windowEvent, hostEvent } from "../decorators";
import { fixture } from "@domx/testutils/fixture";


describe("StateController/decorators", () => {
    
    describe("trackState", () => {
        it("it adds a state property to the controller constructor", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(el.testState instanceof StateController).toBe(true);
            expect((el.testState.constructor as typeof StateController).stateProperties[0]).toBe("state");
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
    
    describe("capture", () => {

        it("stops propagation when the capture option is not set", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            const el2 = document.createElement("test-element-1") as TestElement1;
            el.parentElement?.appendChild(el2);

            const elSpy = jest.spyOn( el.testState, "testHostEvent");
            const el2Spy = jest.spyOn(el2.testState, "testHostEvent");
            el.testHostEvent("foo");
            expect(elSpy).toBeCalledTimes(1);
            expect(el2Spy).toBeCalledTimes(0);
            el2.parentElement?.removeChild(el2);
            el.restore();
        });

        it("does not stop propagation when the capture option is set to false", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            const el2 = document.createElement("test-element-1") as TestElement1;
            el.parentElement?.appendChild(el2);

            const elSpy = jest.spyOn( el.testState, "testWindowEvent");
            const el2Spy = jest.spyOn(el2.testState, "testWindowEvent");
            el.testWindowEvent("foo");
            expect(elSpy).toBeCalledTimes(1);
            expect(el2Spy).toBeCalledTimes(1);
            el2.parentElement?.removeChild(el2);
            el.restore();

        });

    });
});


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

    @stateProperty()
    state:ITestControllerStateData = TestStateController1.defaultState;

    @windowEvent(TestWindowEvent, {capture: false})
    testWindowEvent(event:TestWindowEvent) {
        this.state = { foo: event.testValue };
    }

    @hostEvent(TestHostEvent)
    testHostEvent(event:TestHostEvent) {
        this.state = { foo: event.testValue };
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

