import { describe, it, expect } from "@jest/globals";
import { html, fixture } from "./testHelpers";


describe("StateChange", () => {

  describe("next", () => {
    it("sets the state", () => {
      const el = fixture(html`<test-state-change></test-state-change>`);
      expect(el.state.foo).toBe(false);
      expect(el.state.bar).toBe(false);
      el.testSimple();
      expect(el.state.foo).toBe(true);
      expect(el.state.bar).toBe(true);
      el.restore();
    });

    it("works with a pipe", () => {
      const el = fixture(html`<test-state-change></test-state-change>`);
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
      const el = fixture(html`<test-state-change></test-state-change>`);
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
      const el = fixture(html`<test-state-change></test-state-change>`);
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
      const el = fixture(html`<test-state-change></test-state-change>`);
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
      const el = fixture(html`<test-state-change></test-state-change>`);
      expect(el.state.foo).toBe(false);
      expect(el.state.bar).toBe(false);
      el.testPipeTap();
      expect(el.state.foo).toBe(true);
      expect(el.state.bar).toBe(true);
      el.restore();
    });
  }); 
});
