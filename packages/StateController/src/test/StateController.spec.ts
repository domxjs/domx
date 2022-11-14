import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StateController, RootState } from "../StateController";
import { fixture } from "@domx/testutils/fixture";


describe("StateController", () => {
    describe("state properties", () => {
        it("can be instantiated on an element", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(el.testState instanceof StateController).toBe(true);
            el.restore();
        });

        it("sets the initial state", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(RootState.current['TestStateController1.test1-uid.state']).toMatchObject({ foo: "bar"})
            el.restore();
        });

        it("sets the initial state when stateId is coming from an attribute", () => {
            const el = fixture<TestElement1>(html`<test-element-1 uid="test2-uid"></test-element-1>`);
            expect(RootState.current['TestStateController1.test2-uid.state']).toMatchObject({ foo: "bar"})
            el.restore();
        });

        it("sets the initial state without a stateId", () => {
            const el = fixture<TestElement2>(html`<test-element-2></test-element-2>`);
            expect(RootState.current['TestStateController2.state']).toMatchObject({ foo: "bar"});
            el.restore();
        });

        it("pulls the initial state", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            el.testState.state = { foo: "baz"};
            el.testState.requestUpdate("test");
            const el2 = document.createElement("test-element-1");
            el.parentElement?.appendChild(el2);
            expect(RootState.current['TestStateController1.test1-uid.state']).toMatchObject({ foo: "baz"})
            el.restore();
        });

        it("syncs state with another element", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            const el2 = document.createElement("test-element-1") as TestElement1;
            expect(el.testState.state.foo).toBe("bar");
            el.parentElement?.appendChild(el2);
            el2.testState.state = { foo: "baz"};
            el2.testState.requestUpdate("test");
            expect(el.testState.state.foo).toBe("baz");
            el.restore();
        });

        it("does not sync when element is removed", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            const el2 = document.createElement("test-element-1") as TestElement1;
            expect(el.testState.state.foo).toBe("bar");
            el.parentElement?.appendChild(el2);
            el2.testState.state = { foo: "baz"};
            el2.testState.requestUpdate("test");
            expect(el.testState.state.foo).toBe("baz");
            el.parentElement?.removeChild(el);
            el2.testState.state = { foo: "ban"};
            el2.testState.requestUpdate("test");
            expect(el.testState.state.foo).toBe("baz");
            expect(el2.testState.state.foo).toBe("ban");
            el.restore();
        });

        it("does syncs when element is reconnected", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            const el2 = document.createElement("test-element-1") as TestElement1;
            expect(el.testState.state.foo).toBe("bar");
            el.parentElement?.appendChild(el2);
            el2.testState.state = { foo: "baz"};
            el2.testState.requestUpdate("test");
            expect(el.testState.state.foo).toBe("baz");
            el.parentElement?.removeChild(el);
            el2.testState.state = { foo: "ban"};
            el2.testState.requestUpdate("test");
            expect(el.testState.state.foo).toBe("baz");
            expect(el2.testState.state.foo).toBe("ban");
            el2.parentElement?.appendChild(el);
            expect(el.testState.state.foo).toBe("ban");
            el2.testState.state = { foo: "bar"};
            el2.testState.requestUpdate("test");
            expect(el.testState.state.foo).toBe("bar");
            el.restore();
        });
    });

    describe("refreshState", () => {

        it("refreshes state if the stateId changes", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(RootState.current['TestStateController1.test1-uid.state']).toMatchObject({ foo: "bar"});
            const rootState = RootState.current;
            rootState['TestStateController1.test1-uid-2.state'] = { foo: "test1-uid-2" };
            el.setAttribute("uid", "test1-uid-2");
            el.testState.refreshState();
            expect(el.testState.state.foo).toBe("test1-uid-2");
            el.restore();
        });

    });

    describe("RootState", () => {
        it("removes state when element is removed", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            el.testState.state = { foo: "baz"};
            el.testState.requestUpdate("test");
            expect(RootState.current['TestStateController1.test1-uid.state']).toMatchObject({ foo: "baz"});
            el.parentElement?.removeChild(el);
            expect(RootState.current['TestStateController1.test1-uid.state']).toBeUndefined();
            el.restore();
        });

        it("removes state when elements are removed", () => {
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            el.testState.state = { foo: "baz"};
            el.testState.requestUpdate("test");
            expect(RootState.current['TestStateController1.test1-uid.state']).toMatchObject({ foo: "baz"});
            const el2 = document.createElement("test-element-1") as TestElement1;
            el.parentElement?.appendChild(el2);
            expect(RootState.current['TestStateController1.test1-uid.state']).toMatchObject({ foo: "baz"});
            el.parentElement?.removeChild(el2);
            expect(RootState.current['TestStateController1.test1-uid.state']).toMatchObject({ foo: "baz"});
            el.parentElement?.removeChild(el);
            expect(RootState.current['TestStateController1.test1-uid.state']).toBeUndefined();
            el.restore();
        });

        it("dispatches root state change events", () => {
            let state = {};
            const abort = new AbortController();
            RootState.addRootStateChangeEventListener(event => {
                state = event.rootState;
            }, abort.signal);
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(state).toMatchObject({
                "TestStateController1.test1-uid.state": { foo: "bar"}
            })
            abort.abort();
            el.restore();
        });

        it("matches when items are removed", () => {
            let state = {};
            const abort = new AbortController();
            RootState.addRootStateChangeEventListener(event => {
                state = event.rootState;
            }, abort.signal);
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(state).toMatchObject({
                "TestStateController1.test1-uid.state": { foo: "bar"}
            });
            el.restore();
            expect(state).toMatchObject({});
            abort.abort();
        });

        it("matches when items are removed", () => {
            let state = {};
            const abort = new AbortController();
            RootState.addRootStateChangeEventListener(event => {
                state = event.rootState;
            }, abort.signal);
            const el = fixture<TestElement1>(html`<test-element-1></test-element-1>`);
            expect(state).toMatchObject({
                "TestStateController1.test1-uid.state": { foo: "bar"}
            });
            el.testState.state = { foo: "baz"};
            el.testState.requestUpdate("test");
            expect(state).toMatchObject({
                "TestStateController1.test1-uid.state": { foo: "baz"}
            });
            abort.abort();
            el.testState.state = { foo: "ban"};
            el.testState.requestUpdate("test");
            expect(state).toMatchObject({
                "TestStateController1.test1-uid.state": { foo: "baz"}
            });
            el.restore();
        });

        it("can push changes", () => {
            const el = fixture<TestElement1>(html`<test-element-1 uid="test2-uid"></test-element-1>`);
            expect(RootState.current["TestStateController1.test2-uid.state"]).toMatchObject({ foo: "bar"});
            RootState.push({
                "TestStateController1.test2-uid.state": { foo: "baz" }
            });
            expect(RootState.current["TestStateController1.test2-uid.state"]).toMatchObject({ foo: "baz"});
            el.restore();
        });
    });
    
});


class TestEvent extends Event {
    static eventType = "test-event";
    constructor() {
        super(TestEvent.eventType);
    }
}

/** Without stateId */
class TestStateController2 extends StateController {
    static stateProperties = ["state"];
    static defaultState:ITestControllerStateData = { foo: "bar"};

    state:ITestControllerStateData = TestStateController2.defaultState;
}

class TestStateController1 extends StateController {
    static stateProperties = ["state"];

    static defaultState:ITestControllerStateData = { foo: "bar"};

    state:ITestControllerStateData = TestStateController1.defaultState;

    // pattern for the host to require a stateId
    constructor(host:LitElement & {stateId:string}) {
        super(host);
    }
}


interface ITestControllerStateData {
    foo: string
}


@customElement("test-element-1")
class TestElement1 extends LitElement {

    get stateId() { return this.uid }

    @property({type: String})
    uid!:string;

    testState:TestStateController1 = new TestStateController1(this);

    constructor() {
        super();
        this.uid = "test1-uid";
    }
}


@customElement("test-element-2")
class TestElement2 extends LitElement {
    testState = new TestStateController2(this);
}
