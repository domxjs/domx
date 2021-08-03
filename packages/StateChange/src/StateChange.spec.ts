import sinon from 'sinon/lib/sinon.js';
import { expect } from 'chai';
import { fixture, html, yieldFor } from '../../testHelpers/index';
import { StateChange } from '../StateChange';


describe.skip("StateChange", () => {

  describe("next", () => {
    it("sets the state", () => {
      const el = fixture(html`<test-state-change></test-state-change>`);
      expect(el.state.foo).to.be.false;
      expect(el.state.bar).to.be.false;
      el.testSimple();
      expect(el.state.foo).to.be.true;
      expect(el.state.bar).to.be.true;
      el.restore();
    });

    it("works with a pipe", () => {
      const el = fixture(html`<test-state-change></test-state-change>`);
      expect(el.state.foo).to.be.false;
      expect(el.state.bar).to.be.false;
      el.testPipeNext();
      expect(el.state.foo).to.be.true;
      expect(el.state.bar).to.be.true;
      el.restore();
    });
  });


  describe("dispatch", () => {
    it("triggers a changed event", () => {
      const el = fixture(html`<test-state-change></test-state-change>`);
      const handler = sinon.spy();
      el.addEventListener("state-changed", handler);
      expect(el.state.foo).to.be.false;
      expect(el.state.bar).to.be.false;
      expect(handler.called).to.be.false;
      el.testSimple();
      expect(el.state.foo).to.be.true;
      expect(el.state.bar).to.be.true;
      expect(handler.callCount).to.be.equal(1);
      el.restore();
    });
  });


  describe("tap", () => {
    it("handles functions", async () => {
      const el = fixture(html`<test-state-change></test-state-change>`);
      expect(el.state.foo).to.be.false;
      expect(el.state.bar).to.be.false;
      el.testFunction();
      expect(el.state.foo).to.be.false;
      expect(el.state.bar).to.be.false;
      await yieldFor(10);
      expect(el.state.foo).to.be.true;
      expect(el.state.bar).to.be.true;
      el.restore();
    });

    it("works with a pipe", () => {
      const el = fixture(html`<test-state-change></test-state-change>`);
      expect(el.state.foo).to.be.false;
      expect(el.state.bar).to.be.false;
      el.testPipeTap();
      expect(el.state.foo).to.be.true;
      expect(el.state.bar).to.be.true;
      el.restore();
    });
  });


  describe("mixins", () => {
    it("provides logging", () => {
      const logSpy = sinon.spy(console, "info");
      const el = fixture(html`<test-state-change></test-state-change>`);
      el.testSimple();
      expect(logSpy.called).to.be.true;
      expect(logSpy.lastCall.args[0]).to.be.equal("> STATECHANGE.next: TestStateChange.setBarTrue()");
      logSpy.restore();
      el.restore();
    });
    
    it("logs errors", () => {
      // using a stub so the error does not show in the console
      const logSpy = sinon.stub(console, "error");
      const el = fixture(html`<test-state-change></test-state-change>`);
      const testErrorSpy = sinon.spy(el, "testError");
      try {
        el.testError();      
      } catch (e) {
        expect(testErrorSpy.threw()).to.be.true;
        expect(logSpy.called).to.be.true;
        expect(logSpy.lastCall.lastArg.message).to.be.equal("test error");
      }
      el.restore();
    });
  });  
});



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
}
customElements.define("test-state-change", TestStateChange);


const setFooTrue = state => {
  return {
    ...state,
    foo: true
  };
}

const setBarTrue = state => {
  return {
    ...state,
    bar: true
  };
}

const asyncTest = async stateChange => {
  await yieldFor(10);
  stateChange
    .next(setFooTrue)
    .next(setBarTrue)
    .dispatch();
};

const setFooTrueWithTap = stateChange => 
  stateChange.next(setFooTrue);

const setBarTrueWithTap = stateChange => 
  stateChange.next(setBarTrue);

const causeError = state => {
  throw new Error("test error")
};
