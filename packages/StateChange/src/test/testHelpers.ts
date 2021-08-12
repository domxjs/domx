import { html, TemplateResult, render } from "lit-html";
import { StateChange } from "../StateChange";
export { html, fixture };

interface FixtureElement extends HTMLElement {
    restore: Function,
    state: any,
    testPipeTap: Function,
    testFunction: Function,
    testPipeNext: Function,
    testSimple: Function,
    testError: Function,
    testTapError: Function,
    testDispatchEvent: Function,
    testImmer: Function
};
  
  function fixture(html:TemplateResult): FixtureElement {
    let fixture = document.createElement("div");
    fixture.setAttribute("fixture", "");
    document.body.appendChild(fixture);
  
    render(html, fixture);
    const el = fixture.firstElementChild as FixtureElement;
  
    // set the remove method to remove the fixture
    el.restore = () => fixture.remove()
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
        .next(setBar(true))
        .dispatch();
    }
  
    testPipeNext() {
      StateChange.of(this)
        .pipeNext(
          setFooTrue,
          setBarTrue)
        .dispatch();
    }
  
    testFunction() {
      StateChange.of(this)
        .tap(asyncTest);
    }
  
    testPipeTap() {
      StateChange.of(this)
        .pipeTap(
          setFooTrueWithTap,
          setBarTrueWithTap
        );
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

    testImmer() {
      StateChange.of(this)
        .next(changeStateWithMutations)
    }
}
customElements.define("test-state-change", TestStateChange);
  
  
  
const setFooTrue = (state:any) => {
  return {
    ...state,
    foo: true
  };
};
  
const setBarTrue = (state:any) => {
  return {
    ...state,
    bar: true
  };
};


// for testing inner function name
const setBar = (bar:boolean) =>
    function setBar(state:any) {
      return {
        ...state,
        bar
      };
    };
  
const asyncTest = async (stateChange:StateChange) => {
    await setTimeout(()=> {}, 10);
    stateChange
      .next(setFooTrue)
      .next(setBarTrue)
      .dispatch();
  };
  
const setFooTrueWithTap = (stateChange:StateChange) => 
    stateChange.next(setFooTrue);
  
const setBarTrueWithTap = (stateChange:StateChange) => 
    stateChange.next(setBarTrue);
  
const causeError = (state:any) => {
    throw new Error("test error")
  };


const tapError = (stateChange:StateChange) =>
    stateChange.next(causeError);
  

const changeStateWithMutations = (state:any) => {
  state.bar = true;
  state.newArray = [1];
};

