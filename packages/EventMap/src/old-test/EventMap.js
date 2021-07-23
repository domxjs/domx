
import sinon from 'sinon/lib/sinon.js';
import { expect } from 'chai';
import { fixture, html } from '../../testHelpers/index';
import { EventMap, eventsListenAt, event } from '../EventMap.js';


const test1Html = html`
  <event-map-test-1>
    <child-element id="child"></child-element>
  </event-map-test-1>
`;

const noEventsTestHtml = html`
  <event-map-with-no-events></event-map-with-no-events>
`;

const defaultListenAtHtml = html`
  <default-listen-at></default-listen-at>
`;


describe.skip("EventMap", function () {
  beforeEach(function () {
      window.firedEvents = {};
  });

  describe("Setup", function () {

      it("is an HTMLElement", function () {
          let frag = fixture(test1Html);
          expect(frag instanceof HTMLElement).to.be.true;
          frag.restore();
      });

      it("supports not defining a static events property", function () {
          let frag = fixture(noEventsTestHtml);
          /*
          * make sure there is no error with an element that
          * does not define the static events property.
          */
          expect(frag instanceof HTMLElement).to.be.true;
          frag.restore();
      });

      it("throws an error if a handler is not defined", function () {
        var badFn = function () {
          /*
          * attaching to the dom calls the connectedCallback async
          * so just call the method directly
          */
          let el = document.createElement("event-map-with-bad-event-handler");
          el.connectedCallback();         
        };
        expect(badFn).to.throw(Error, "EventMap method does not exist: _doesNotExist");
      });

      it("throws an error if a listener could not be attached", () => {
          const badFn = () => {
            let el = document.createElement("event-map-with-bad-event-listener");
            el.connectedCallback();            
          };

          expect(badFn).to.throw(Error, "EventMap could not set up a listener at invalidListener");
      });
  });

  describe("Events", function () {
    var frag, child, event;

    beforeEach(function () {
      frag = fixture(test1Html);
      child = frag.querySelector("#child");
      event = new CustomEvent('event-to-trigger', { bubbles: true, composed: true });      
    });

    afterEach(() => {
      frag.restore();
    });

    it("handles an event", function () {
      child.dispatchEvent(event);
      expect(window.firedEvents._toTrigger).to.be.equal("triggered");
    });

    it("detaches the event", function () {
      frag.restore();
      child.dispatchEvent(event);
      expect(window.firedEvents._toTrigger).to.be.equal();
    });

    it("stops event propagation", function () {
      let listener = (event) => {
          throw new Error("IT BUBBLED");
      };

      window.addEventListener("event-to-trigger", listener);
      expect(() => child.dispatchEvent(event)).to.not.throw();
      window.removeEventListener("event-to-trigger", listener);
    });
  });

  describe("Events at parent", function () {
    var frag, event;

    beforeEach(function () {
      frag = fixture(test1Html);
      event = new CustomEvent('event-to-test-parent', { bubbles: true, composed: true });
    });

    afterEach(() => {
      frag.restore();
    });

    it("handles an event", function () {
      frag.dispatchEvent(event);
      expect(window.firedEvents._toTrigger).to.be.equal("triggeredOnParent");
    });

    it("detaches the event", function () {
      frag.remove();
      frag.dispatchEvent(event);
      expect(window.firedEvents._toTrigger).to.be.equal();
    });

    it("stops event propagation", function () {
      let listener = (event) => {
          throw new Error("IT BUBBLED");
      };

      window.addEventListener("event-to-test-parent", listener);
      expect(() => child.dispatchEvent(event)).to.not.throw();
      window.removeEventListener("event-to-test-parent", listener);
    });
  });

  describe("Events at window", function () {
    var frag, event;

    beforeEach(function () {
      frag = fixture(test1Html);
      event = new CustomEvent('event-to-test-window', { bubbles: true, composed: true });
    });

    afterEach(() => {
      frag.restore();
    });

    it("handles an event", function () {
      frag.dispatchEvent(event);
      expect(window.firedEvents._toTrigger).to.be.equal("triggeredOnWindow");
    });

    it("detaches the event", function () {
      frag.restore();
      frag.dispatchEvent(event);
      expect(window.firedEvents._toTrigger).to.be.equal();
    });
  });

  describe("Mixed in events", () => {
    let el = null;

    beforeEach(() => {
      el = fixture(html`<element-with-mixed-in-events></element-with-mixed-in-events>`);
    });

    afterEach(() => {
      el.remove();
    });

    it("handles the mixed in event", () => {
      el.dispatchEvent(new CustomEvent("mixed-in-event"));
      expect(window.firedEvents._mixedInEvent).to.be.equal(true);
    });

    it("handles a stomped event", () => {
      el.dispatchEvent(new CustomEvent("stomped-event"));
      expect(window.firedEvents._stompedEvent).to.be.equal(true);
    });

    it("handles a normal event", () => {
      el.dispatchEvent(new CustomEvent("normal-event"));
      expect(window.firedEvents._normalEvent).to.be.equal(true);
    });
  });

  describe("eventsListenAt", () => {
    let frag;

    beforeEach(() => {
      frag = fixture(defaultListenAtHtml);
    });

    afterEach(() => {
      frag.restore();
    });

    it("changes the defualt listenAt:to window", () => {
      frag = frag;
      window.dispatchEvent(new CustomEvent("trigger-on-default", { bubbles: true, composed: true }));
      expect(window.firedEvents._triggerOnDefault).to.be.equal(true);
    });

    it("still respects listenAt:on parent", () => {
      frag.dispatchEvent(new CustomEvent("trigger-on-listen-at", { bubbles: true }));
      expect(window.firedEvents._triggerOnListenAt).to.be.equal(true);
    });
  });

  describe("decorators", () => {
    describe("eventsListenAt", () => {
      it("can be used on the class in place of the static eventsListenAtProperty", () => {
        const el = fixture(html`<events-listen-at-descriptor></events-listen-at-descriptor>`);
        window.dispatchEvent(new CustomEvent("trigger-on-default", { bubbles: true, composed: true }));
        expect(window.firedEvents._triggerOnDefault).to.be.equal(true);
        el.restore();
      });
    });

    describe("event", () => {
      it("can be used on a method to define an event handler", () => {
        const el = fixture(html`<event-descriptor></event-descriptor>`);
        window.dispatchEvent(new CustomEvent("trigger-on-default", { bubbles: true, composed: true }));
        expect(window.firedEvents._triggerOnDefault).to.be.equal(true);
        el.restore();
      });
      
      it("can be used on a method to define an event handler and change the listenAt", () => {
        const el = fixture(html`<event-descriptor></event-descriptor>`);
        el.dispatchEvent(new CustomEvent("trigger-on-listen-at", { bubbles: true, composed: true }));
        expect(window.firedEvents._triggerOnListenAt).to.be.equal(true);
        el.restore();
      });
    });
  });


  describe("multiple handlers", () => {

    it("handles both event types", () => {
      const el = fixture(html`<event-map-multiple-handlers></event-map-multiple-handlers>`);
      const spy = sinon.spy(el, "handler1");
      el.dispatchEvent(new CustomEvent("handle-first-event"));
      expect(spy.callCount).to.be.equal(1);
      el.dispatchEvent(new CustomEvent("handle-second-event"));
      expect(spy.callCount).to.be.equal(2);
      el.restore();
      spy.restore();
    });

    it("removes both handlers", () => {
      const el = fixture(html`<event-map-multiple-handlers></event-map-multiple-handlers>`);
      const spy = sinon.spy(el, "handler1");
      el.dispatchEvent(new CustomEvent("handle-first-event"));
      expect(spy.callCount).to.be.equal(1);
      el.dispatchEvent(new CustomEvent("handle-second-event"));
      expect(spy.callCount).to.be.equal(2);
      el.restore();
      el.dispatchEvent(new CustomEvent("handle-first-event"));
      expect(spy.callCount).to.be.equal(2);
      el.dispatchEvent(new CustomEvent("handle-second-event"));
      expect(spy.callCount).to.be.equal(2);
      spy.restore();
    });
  });
});


/**
 * A class used to test the EventMap mixin.
 */
class EventMapTest1 extends EventMap(HTMLElement) {
  static events = {
    "event-to-trigger": "_toTrigger",
    "event-to-test-parent": {
      listenAt: "parent",
      handler: "_toTestParent"
    },
    "event-to-test-window": {
      listenAt: "window",
      handler: "_toTestWindow"
    }
  };
  _toTrigger() {
      window.firedEvents._toTrigger = "triggered";
  }
  _toTestParent() {
      window.firedEvents._toTrigger = "triggeredOnParent";
  }
  _toTestWindow() {
      window.firedEvents._toTrigger = "triggeredOnWindow";
  }
}
customElements.define("event-map-test-1", EventMapTest1);

/**
 * A class that has no events defined.
 */
class EventsMapWithNoEvents extends EventMap(HTMLElement) { }
customElements.define("event-map-with-no-events", EventsMapWithNoEvents);

/**
 * A class with a bad handler
 */
class EventsMapWithBadEventHandler extends EventMap(HTMLElement) {
  static events = {
    "non-existing-handler": "_doesNotExist"
  };
}
customElements.define("event-map-with-bad-event-handler", EventsMapWithBadEventHandler);

/**
 * A class with a bad listener
 */
class EventsMapWithBadEventListener extends EventMap(HTMLElement) {
  static events = {
      "non-existing-listener": {
        listenAt: "invalidListener",
        handler: "_handler"
      }
    };
  _handler() { }
}
customElements.define("event-map-with-bad-event-listener", EventsMapWithBadEventListener);

/**
 * A child element used to trigger events.
 */
class ChildElement extends HTMLElement { }
customElements.define("child-element", ChildElement);

/**
 * A mixin to test mixed in events.
 */
let MixedInEvents = (superclass) => class extends EventMap(superclass) {
  static events = {
    "stomped-event": "_stompedEvent",
    "mixed-in-event": "_mixedInEvent"
  };
  _stompedEvent() {
      throw new Error("This handler should not be called");
  }
  _mixedInEvent() {
      window.firedEvents._mixedInEvent = true;
  }
};

/**
 * A class to test mixed in events
 */
class ElementWithMixedInEvents extends MixedInEvents(HTMLElement) {
  static events = {
    "stomped-event": "_stompedEvent",
    "normal-event": "_normalEvent"
  };
  _stompedEvent() {
      window.firedEvents._stompedEvent = true;
  }
  _normalEvent() {
      window.firedEvents._normalEvent = true;
  }
}
customElements.define("element-with-mixed-in-events", ElementWithMixedInEvents);

/**
 * A class to test the static eventsListenAt property.
 */
class DefaultListenAt extends EventMap(HTMLElement) {
  static eventsListenAt = "window";
  
  static events = {
      "trigger-on-default": "_triggerOnDefault",
      "trigger-on-listen-at": {
          listenAt: "parent",
          handler: "_triggerOnListenAt"
      }
  };
  _triggerOnDefault() {
      window.firedEvents._triggerOnDefault = true;
  }
  _triggerOnListenAt() {
      window.firedEvents._triggerOnListenAt = true;
  }
}
customElements.define("default-listen-at", DefaultListenAt);


@eventsListenAt("window")
class EventsListenAtDescriptor extends EventMap(HTMLElement) {
  static events = {
      "trigger-on-default": "_triggerOnDefault",
  };
  _triggerOnDefault() {
      window.firedEvents._triggerOnDefault = true;
  }
}
customElements.define("events-listen-at-descriptor", EventsListenAtDescriptor);


@eventsListenAt("window")
class EventDescriptor extends EventMap(HTMLElement) {

  @event("trigger-on-default")
  _triggerOnDefault() {
      window.firedEvents._triggerOnDefault = true;
  }

  @event("trigger-on-listen-at", {listenAt: "parent"})
  _triggerOnListenAt() {
    window.firedEvents._triggerOnListenAt = true;
  }
}
customElements.define("event-descriptor", EventDescriptor);



class MultipleHandlers extends EventMap(HTMLElement) {
  @event("handle-first-event")
  @event("handle-second-event")
  handler1(event) {

  }
}
customElements.define("event-map-multiple-handlers", MultipleHandlers);
