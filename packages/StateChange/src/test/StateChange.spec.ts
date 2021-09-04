import { describe, it, expect } from "@jest/globals";
import { html, fixture, TestStateChange,TestStateProp1, TestStateProp2, TestStateProp3 } from "./testHelpers";


describe("StateChange", () => {

  describe("next", () => {
    it("sets the state", () => {
      const el = fixture<TestStateChange>(html`<test-state-change></test-state-change>`);
      expect(el.state.foo).toBe(false);
      expect(el.state.bar).toBe(false);
      el.testSimple();
      expect(el.state.foo).toBe(true);
      expect(el.state.bar).toBe(true);
      el.restore();
    });

    it("works with a pipe", () => {
      const el = fixture<TestStateChange>(html`<test-state-change></test-state-change>`);
      expect(el.state.foo).toBe(false);
      expect(el.state.bar).toBe(false);
      el.testPipeNext();
      expect(el.state.foo).toBe(true);
      expect(el.state.bar).toBe(true);
      el.restore();
    });
  });

  describe("dispatch", () => {
    it("triggers a changed event", () => {
      const el = fixture<TestStateChange>(html`<test-state-change></test-state-change>`);
      const handler = jest.fn();
      el.addEventListener("state-changed", handler);
      expect(el.state.foo).toBe(false);
      expect(el.state.bar).toBe(false);
      expect(handler).not.toBeCalled();
      el.testSimple();
      expect(el.state.foo).toBe(true);
      expect(el.state.bar).toBe(true);
      expect(handler).toBeCalledTimes(1);
      el.restore();
    });

    it("can dispatch an event", () => {
      const el = fixture<TestStateChange>(html`<test-state-change></test-state-change>`);
      const handler = jest.fn();
      window.addEventListener("test-dispatch-event", handler);
      expect(handler).toBeCalledTimes(0);
      el.testDispatchEvent();
      expect(handler).toBeCalledTimes(1);
      el.restore();
    });
  });

  describe("tap", () => {
    it("handles functions", async () => {
      const el = fixture<TestStateChange>(html`<test-state-change></test-state-change>`);
      expect(el.state.foo).toBe(false);
      expect(el.state.bar).toBe(false);
      el.testFunction();
      expect(el.state.foo).toBe(false);
      expect(el.state.bar).toBe(false);
      await setTimeout(()=> {}, 10);
      expect(el.state.foo).toBe(true);
      expect(el.state.bar).toBe(true);
      el.restore();
    });

    it("works with a pipe", () => {
      const el = fixture<TestStateChange>(html`<test-state-change></test-state-change>`);
      expect(el.state.foo).toBe(false);
      expect(el.state.bar).toBe(false);
      el.testPipeTap();
      expect(el.state.foo).toBe(true);
      expect(el.state.bar).toBe(true);
      el.restore();
    });
  });

  describe("options", () => {

    it("can use the options object to define property and changeEvent", () => {
      const el = fixture<TestStateProp1>(html`<test-state-prop1></test-state-prop1>`)
      expect(el.user.userName).toBe("joeuser");
      let isCalled = false;
      el.addEventListener("user-state-changed", () => {
        isCalled = true;
      });
      el.changeName("joeUserChanged");
      expect(el.user.userName).toBe("joeUserChanged");
      expect(isCalled).toBe(true);
      el.restore();
    });

    it("can use a string as the options for the property name", () => {
      const el = fixture<TestStateProp2>(html`<test-state-prop2></test-state-prop2>`)
      expect(el.user.userName).toBe("joeuser");
      let isCalled = false;
      el.addEventListener("user-changed", () => {
        isCalled = true;
      });
      el.changeName("joeUserChanged2");
      expect(el.user.userName).toBe("joeUserChanged2");
      expect(isCalled).toBe(true);
      el.restore();
    });

    it("can use a string as the options and match a data property", () => {
      const el = fixture<TestStateProp3>(html`<test-state-prop3></test-state-prop3>`)
      expect(el.user.userName).toBe("joeuser");
      let isCalled = false;
      el.addEventListener("user-change-event", () => {
        isCalled = true;
      });
      el.changeName("joeUserChanged3");
      expect(el.user.userName).toBe("joeUserChanged3");
      expect(isCalled).toBe(true);
      el.restore();
    });
  });
});
