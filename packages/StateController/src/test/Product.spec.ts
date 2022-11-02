import { fixture } from "@domx/testutils";
import { describe, it, expect } from "@jest/globals";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { hostEvent, stateProperty } from "../decorators";
import { StateController } from "../StateController";
import { Product } from "../Product";


describe("Product", () => {

  describe("next", () => {
    it("sets the state", () => {
      const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
      expect(el.testState.state.foo).toBe(false);
      expect(el.testState.state.bar).toBe(false);
      el.testNext();
      expect(el.testState.state.foo).toBe(true);
      expect(el.testState.state.bar).toBe(true);
      el.restore();
    });

    it("works with a pipe", () => {
      const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
      expect(el.testState.state.foo).toBe(false);
      expect(el.testState.state.bar).toBe(false);
      el.testPipeNext();
      expect(el.testState.state.foo).toBe(true);
      expect(el.testState.state.bar).toBe(true);
      el.restore();
    });
  });

  describe("requestUpdate", () => {
    it("calls requestUpdate on the controller", () => {
      const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
      const spy = jest.spyOn( el.testState, "requestUpdate");
      expect(el.testState.state.foo).toBe(false);
      expect(el.testState.state.bar).toBe(false);
      expect(spy).not.toBeCalled();
      el.testNext();
      expect(el.testState.state.foo).toBe(true);
      expect(el.testState.state.bar).toBe(true);
      expect(spy).toBeCalledTimes(1);
      el.restore();
      spy.mockRestore();
    });
  });

    describe("tap", () => {
        it("handles functions", async () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(el.testState.state.foo).toBe(false);
            expect(el.testState.state.bar).toBe(false);
            el.testTap();
            expect(el.testState.state.foo).toBe(false);
            expect(el.testState.state.bar).toBe(false);
            await setTimeout(()=> {}, 10);
            expect(el.testState.state.foo).toBe(true);
            expect(el.testState.state.bar).toBe(true);
            el.restore();
        });

        it("works with a pipe", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(el.testState.state.foo).toBe(false);
            expect(el.testState.state.bar).toBe(false);
            el.testPipeTap();
            expect(el.testState.state.foo).toBe(true);
            expect(el.testState.state.bar).toBe(true);
            el.restore();
        });
    });

    describe("dispatchHostEvent", () => {
        it("can dispatch an event on the host element", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            const ac = new AbortController();
            let called = false;
            el.addEventListener(CurrentStateEvent.eventType, (event:Event) => {               
                called = true;
            }, { signal: ac.signal});
            el.testGetState();
            expect(called).toBe(true);
            el.restore();
            ac.abort();
        });

    });

    describe("getState", () => {
        it("returns the current state", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            const ac = new AbortController();
            el.addEventListener(CurrentStateEvent.eventType, (event:Event) => {
                const currentStateEvent = event as CurrentStateEvent;
                expect(currentStateEvent.state.foo).toBe(true);
                expect(currentStateEvent.state.bar).toBe(false);
            }, { signal: ac.signal});
            el.testState.state.foo = true;
            el.testGetState();
            el.restore();
            ac.abort();
        });
    });

    describe("functional static methods", () => {

        it("can execute the static functional methods", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            el.testStatic();
            const state = el.testState.state;
            // mainly testing that there are no errors when calling these pass through functions
            expect(state.foo).toBe(true);
            el.restore();
        });
    });
});




interface ITestState {
    foo: boolean,
    bar: boolean
}

class TestNextEvent extends Event {
    static eventType = "test-next";
    constructor() {
        super(TestNextEvent.eventType);
    }
}

class PipeNextEvent extends Event {
    static eventType = "pipe-next";
    constructor() {
        super(PipeNextEvent.eventType);
    }
}

class TestTapEvent extends Event {
    static eventType = "test-tap";
    constructor() {
        super(TestTapEvent.eventType);
    }
}

class TestPipeTapEvent extends Event {
    static eventType = "pipe-tap";
    constructor() {
        super(TestPipeTapEvent.eventType);
    }
}

class TestGetStateEvent extends Event {
    static eventType = "get-state";
    constructor() {
        super(TestGetStateEvent.eventType);
    }
}

class CurrentStateEvent extends Event {
    static eventType = "current-state";
    state:ITestState;
    constructor(state:ITestState) {
        super(CurrentStateEvent.eventType);
        this.state = state;
    }
}

class TestFunctionalStaticMethodsEvent extends Event {
    static eventType = "test-static";
    constructor() {
        super(TestFunctionalStaticMethodsEvent.eventType);
    }
}

@customElement("test-element-1")
class TestElement1 extends LitElement {
    public testState = new TestStateController1(this);

    public testNext() {
        this.dispatchEvent(new TestNextEvent());
    }

    public testPipeNext() {
        this.dispatchEvent(new PipeNextEvent());
    }

    public testTap() {
        this.dispatchEvent(new TestTapEvent());
    }

    public testPipeTap() {
        this.dispatchEvent(new TestPipeTapEvent());
    }

    public testGetState() {
        this.dispatchEvent(new TestGetStateEvent());
    }

    public testStatic() {
        this.dispatchEvent(new TestFunctionalStaticMethodsEvent());
    }
}

class TestStateController1 extends StateController {
    static defaultState:ITestState = { foo: false, bar: false };

    @stateProperty()
    state:ITestState = TestStateController1.defaultState;

    @hostEvent(TestNextEvent)
    testNext(event:TestNextEvent) {
        Product.of<ITestState>(this, "state")
            .next(setFoo(true))
            .next(setBarTrue)
            .requestUpdate(event);
    }

    @hostEvent(PipeNextEvent)
    pipeNextTest(event:PipeNextEvent) {
        Product.of<ITestState>(this, "state")
            .pipeNext(
                setFooTrue,
                setBarTrue
            )
            .requestUpdate(event);
    }

    @hostEvent(TestTapEvent)
    testTap(event:TestTapEvent) {
        Product.of<ITestState>(this, "state")
            .tap(testTap);
    }

    @hostEvent(TestPipeTapEvent)
    testPipeTap(event:TestPipeTapEvent) {
        Product.of<ITestState>(this, "state")
            .pipeTap(
                setFooTrueWithTap,
                setBarTrueWithTap
            );
    }

    @hostEvent(TestGetStateEvent)
    testGetState(event:TestGetStateEvent) {
        Product.of<ITestState>(this, "state")
            .tap(getState);
    }

    @hostEvent(TestFunctionalStaticMethodsEvent)
    testFunctionalStaticMethods() {
        Product.of<ITestState>(this, "state")
            .tap(testFunctionalStaticMethods);

    }
}

const testFunctionalStaticMethods = (product:Product<ITestState>) => {
    Product.next(setFooTrue)(product);
    Product.tap(setBarTrueWithTap)(product);
    Product.getState(product);
    Product.dispatchHostEvent(new CurrentStateEvent(product.getState()))(product);
    Product.requestUpdate("test")(product);
    Product.tapWith(product)(setBarTrueWithTap)
    Product.nextWith(product)(setFooTrue);
};


const setFoo = (isFoo:boolean) => (state:ITestState) => {
    state.foo = isFoo;
};

const setFooTrue = (state:ITestState) => {
    state.foo = true;
};

const setBarTrue = (state:ITestState) => {
    state.bar = true;
};

const testTap = async (product:Product<ITestState>) => {
    await setTimeout(()=> {}, 5);
    product
        .next(setFooTrue)
        .next(setBarTrue)
        .requestUpdate("testTap");
};
  
const setFooTrueWithTap = (product:Product<ITestState>) => 
    product.next(setFooTrue);
  
const setBarTrueWithTap = (product:Product<ITestState>) => 
    product.next(setBarTrue);


const getState = (product:Product<ITestState>) => {
    const state = product.getState();
    product.dispatchHostEvent(new CurrentStateEvent(state));
};

