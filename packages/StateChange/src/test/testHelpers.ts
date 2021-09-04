import { html, TemplateResult, render } from "lit-html";
import { StateChange } from "../StateChange";
export { html, fixture };

interface FixtureElement extends HTMLElement {
    /** Removes the fixture; which also removes the element and any listeners. */
    restore: Function
};
  
function fixture<T>(html:TemplateResult): FixtureElement & T {
  let fixture = document.createElement("div");
  fixture.setAttribute("fixture", "");
  document.body.appendChild(fixture);

  render(html, fixture);
  const el = fixture.firstElementChild as FixtureElement & T;

  // set the remove method to remove the fixture
  el.restore = () => fixture.remove()
  return el;
}


export class TestStateProp1 extends HTMLElement {
  user = {
    userName: "joeuser"
  };
  changeName(userName: string) {
    StateChange.of(this, {
      property: "user",
      changeEvent: "user-state-changed"
    }).next((state:any) => ({
        ...state,
        userName
      }))
      .dispatch();
  }
}
customElements.define("test-state-prop1", TestStateProp1);

export class TestStateProp2 extends HTMLElement {
  user = {
    userName: "joeuser"
  };
  changeName(userName: string) {
    StateChange.of(this, "user")
      .next((state:any) => ({
        ...state,
        userName
      }))
      .dispatch();
  }
}
customElements.define("test-state-prop2", TestStateProp2);


export class TestStateProp3 extends HTMLElement {
  static dataProperties = {
    user: {
      changeEvent: "user-change-event"
    }
  }

  user = {
    userName: "joeuser"
  };

  changeName(userName: string) {
    StateChange.of(this, "user")
      .next((state:any) => ({
        ...state,
        userName
      }))
      .dispatch();
  }
}
customElements.define("test-state-prop3", TestStateProp3);

  
export class TestStateChange extends HTMLElement {
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
    await setTimeout(()=> {});
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

