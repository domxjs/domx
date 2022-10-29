import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import { hostEvent, trackState, windowEvent } from "../decorators";
import { StateController } from "../StateController";


describe("StateController", () => {
    it("passes", () => {
        expect(true).toBeDefined();
    });
});


class TestEvent extends Event {
    static eventType = "test-event";
    constructor() {
        super(TestEvent.eventType);
    }
}



class TestStateController extends StateController {
    static defaultState:ITestControllerStateData = { foo: "bar"};

    //@trackState()
    state:ITestControllerStateData = TestStateController.defaultState;

    constructor(host:LitElement & {stateId:string}) {
        super(host);
        // this.trackState("state");
    }

    @windowEvent(TestEvent)
    someEvent(event:TestEvent) {
        this.state.foo = "baz";
    }

    @hostEvent(TestEvent)
    async someEvent2(event:TestEvent) {
        // use immer on state!
        // does immer work with async stuff?
        // can do an await and change properties
        // Produce.of(this, "state")
        //      .next(doStuff)
        //      .requestUpdate(event) // would show same event at two different locations
        //                               how do draw the connection between those? May be fine
        //      .next(doAsyncStuff)
        //      .next()
        // 
        // this.state = await produce(this.state, doAsyncStuff)
        this.state.foo = "baz";
        await doAsyncStuff(this.state);
        this.requestUpdate(event);
    }
}

const doAsyncStuff = async (state:ITestControllerStateData) => {
    // await do something
    // state.foo = "bar";
}



class TestElement extends LitElement {

    get stateId() { return this.uid }

    @property({type: String})
    uid!:string;

    //@controller(TestStateController, () => this.uid)
    private testState = new TestStateController(this);

    foo(testStateController:typeof TestStateController) {
        const test = this.testState.state;
        test.foo;
        //new testStateController(this)
    }
}


interface ITestControllerStateData {
    foo: string
}