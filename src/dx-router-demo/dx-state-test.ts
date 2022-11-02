import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { hostEvent, Product, StateController, stateProperty } from "@domx/statecontroller";
import { connectRdtLogger } from "@domx/statecontroller";

connectRdtLogger("test-state-logger");


@customElement("dx-state-test")
class StateTest extends LitElement {

    get stateId() { return this.inputId; }

    @property({type:String, attribute: "input-id"})
    inputId:string;

    testState:TestStateController = new TestStateController(this);

    render() {
        const state = this.testState.state;
        return html`
            Input ID: ${this.inputId}
            <input type="text"
                .value=${state.value}
                placeholder=${state.placeholder}
                @keyup=${this.keyup}>
            ${state.value}
        `;
    }

    keyup(event:KeyboardEvent) {
        const target = event.target as HTMLInputElement;
        this.dispatchEvent(new TestInputEvent(target.value));
    }

    static styles = [css`
        :host {
            display: block;
            margin: 1rem 0;
            padding: 1rem;
            border: 1px solid #555;
        }
        input {
            line-height: 2rem;
            font-size: 16px;
            background-color: #333;
            color: white;
            margin-left: 1rem;
            outline: 0;
            border: 0;
            padding-left: 8px;
        }
  `]
}


interface ITestState {
    value:string;
    placeholder:string;
}

class TestInputEvent extends Event {
    static eventType = "test-input";
    value:string;
    constructor(value:string) {
        super(TestInputEvent.eventType);
        this.value = value;
    }
}

class TestStateController extends StateController {

    @stateProperty()
    state:ITestState = { placeholder: "Enter input", value: "" }

    @hostEvent(TestInputEvent)
    testInput(event:TestInputEvent) {
        Product<ITestState>.of(this, "state")
            .next(setValue(event.value))
            .requestUpdate(event);
    }
}

const setValue = (value:string) => (state:ITestState) => {
    state.value = value;
};