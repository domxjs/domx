import { html, render } from "lit-html";
import { StateChange } from "../StateChange";
export { html, fixture };
;
function fixture(html) {
    let fixture = document.createElement("div");
    fixture.setAttribute("fixture", "");
    document.body.appendChild(fixture);
    render(html, fixture);
    const el = fixture.firstElementChild;
    // set the remove method to remove the fixture
    el.restore = () => fixture.remove();
    return el;
}
class TestStateChange extends HTMLElement {
    state = {
        foo: false,
        bar: false
    };
    testSimple() {
        StateChange.of(this)
            .next(setFooTrue)
            .next(setBarTrue)
            .dispatch();
    }
    testPipeNext() {
        StateChange.of(this)
            .pipeNext(setFooTrue, setBarTrue)
            .dispatch();
    }
    testFunction() {
        StateChange.of(this)
            .tap(asyncTest);
    }
    testPipeTap() {
        StateChange.of(this)
            .pipeTap(setFooTrueWithTap, setBarTrueWithTap);
    }
    testError() {
        StateChange.of(this)
            .next(setFooTrue)
            .next(causeError)
            .dispatch();
    }
    testTapError() {
        StateChange.of(this)
            .tap(tapError);
    }
    testDispatchEvent() {
        StateChange.of(this)
            .dispatchEvent(new CustomEvent("test-dispatch-event", {
            bubbles: true,
            composed: true
        }));
    }
}
customElements.define("test-state-change", TestStateChange);
const setFooTrue = (state) => {
    return {
        ...state,
        foo: true
    };
};
const setBarTrue = (state) => {
    return {
        ...state,
        bar: true
    };
};
const asyncTest = async (stateChange) => {
    await setTimeout(() => { }, 10);
    stateChange
        .next(setFooTrue)
        .next(setBarTrue)
        .dispatch();
};
const setFooTrueWithTap = (stateChange) => stateChange.next(setFooTrue);
const setBarTrueWithTap = (stateChange) => stateChange.next(setBarTrue);
const causeError = (state) => {
    throw new Error("test error");
};
const tapError = (stateChange) => stateChange.next(causeError);
//# sourceMappingURL=testHelpers.js.map