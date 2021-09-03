
import { describe, it, expect } from "@jest/globals";
import { html, TemplateResult, render } from "lit-html";
import { EventMap, EventMapHandlerInfo, eventsListenAt, event } from "./EventMap";


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


let __firedEvents: any = {};

interface RestorableElement extends HTMLElement {
    restore: Function
};

function fixture(html:TemplateResult): RestorableElement {
  let fixture = document.createElement("div");
  fixture.setAttribute("fixture", "");
  document.body.appendChild(fixture);

  render(html, fixture);
  const el = fixture.firstElementChild as RestorableElement;

  // set the remove method to remove the fixture
  el.restore = () => fixture.remove()
  return el;
}


describe("EventMap", function () {
  beforeEach(function () {
      __firedEvents = {};
  });

  describe("Setup", function () {

      it("is an HTMLElement", function () {
          const frag = fixture(test1Html);
          expect(frag instanceof HTMLElement).toBe(true);
          frag.restore();
      });

      it("supports not defining a static events property", function () {
          const frag = fixture(noEventsTestHtml);
          /*
          * make sure there is no error with an element that
          * does not define the static events property.
          */
          const isHTMLElement = frag instanceof HTMLElement;
          expect(isHTMLElement).toBe(true);
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
        expect(badFn).toThrowError(new Error("EventMap method does not exist: _doesNotExist"));
      });

      it("throws an error if a listener could not be attached", () => {
          const badFn = () => {
            let el = document.createElement("event-map-with-bad-event-listener");
            el.connectedCallback();            
          };

          expect(badFn).toThrowError(new Error("EventMap could not set up a listener at invalidListener"));
      });
  });

  describe("Events", function () {
    var frag:RestorableElement, child:Element, event:CustomEvent;

    beforeEach(function () {
      frag = fixture(test1Html);
      child = frag.querySelector("#child") as RestorableElement;
      event = new CustomEvent('event-to-trigger', { bubbles: true, composed: true });      
    });

    afterEach(() => {
      frag.restore();
    });

    it("handles an event", function () {
      child.dispatchEvent(event);
      expect(__firedEvents._toTrigger).toBe("triggered");
    });

    it("detaches the event", function () {
      frag.restore();
      child.dispatchEvent(event);
      expect(__firedEvents._toTrigger).toBeUndefined();
    });

    it("stops event propagation", function () {
      let listener = () => {
          throw new Error("IT BUBBLED");
      };

      window.addEventListener("event-to-trigger", listener);
      expect(() => child.dispatchEvent(event)).not.toThrow();
      window.removeEventListener("event-to-trigger", listener);
    });

    it("does not stop event propagation set to false", function () {
      let listenerTriggered = false;
      let listener = () => {
        listenerTriggered = true
      };

      const event = new CustomEvent('event-to-test-stop-propagation', { bubbles: true, composed: true });
      window.addEventListener("event-to-test-stop-propagation", listener);
      child.dispatchEvent(event)
      expect(listenerTriggered).toBe(true);
      window.removeEventListener("event-to-test-stop-propagation", listener);
    });
  });

  describe("Events at parent", function () {
    var frag:RestorableElement, child:Element, event:CustomEvent;

    beforeEach(function () {
      frag = fixture(test1Html);
      child = frag.querySelector("#child") as Element;
      event = new CustomEvent('event-to-test-parent', { bubbles: true, composed: true });
    });

    afterEach(() => {
      frag.restore();
    });

    it("handles an event", function () {
      frag.dispatchEvent(event);
      expect(__firedEvents._toTrigger).toBe("triggeredOnParent");
    });

    it("detaches the event", function () {
      frag.remove();
      frag.dispatchEvent(event);
      expect(__firedEvents._toTrigger).toBeUndefined();
    });

    it("stops event propagation", function () {
      let listener = () => {
          throw new Error("IT BUBBLED");
      };

      window.addEventListener("event-to-test-parent", listener);
      expect(() => child.dispatchEvent(event)).not.toThrow();
      window.removeEventListener("event-to-test-parent", listener);
    });
  });

  describe("Events at window", function () {
    var frag:RestorableElement, event:CustomEvent;

    beforeEach(function () {
      frag = fixture(test1Html);
      event = new CustomEvent('event-to-test-window', { bubbles: true, composed: true });
    });

    afterEach(() => {
      frag.restore();
    });

    it("handles an event", function () {
      frag.dispatchEvent(event);
      expect(__firedEvents._toTrigger).toBe("triggeredOnWindow");
    });

    it("detaches the event", function () {
      frag.restore();
      frag.dispatchEvent(event);
      expect(__firedEvents._toTrigger).toBeUndefined();
    });
  });

  describe("Mixed in events", () => {
    let el:RestorableElement;

    beforeEach(() => {
      el = fixture(html`<element-with-mixed-in-events></element-with-mixed-in-events>`);
    });

    afterEach(() => {
      el.remove();
    });

    it("handles the mixed in event", () => {
      el.dispatchEvent(new CustomEvent("mixed-in-event"));
      expect(__firedEvents._mixedInEvent).toBe(true);
    });

    it("handles a stomped event", () => {
      el.dispatchEvent(new CustomEvent("stomped-event"));
      expect(__firedEvents._stompedEvent).toBe(true);
    });

    it("handles a normal event", () => {
      el.dispatchEvent(new CustomEvent("normal-event"));
      expect(__firedEvents._normalEvent).toBe(true);
    });
  });

  describe("eventsListenAt", () => {
    let frag:RestorableElement;

    beforeEach(() => {
      frag = fixture(defaultListenAtHtml);
    });

    afterEach(() => {
      frag.restore();
    });

    it("changes the defualt listenAt:to window", () => {
      frag = frag;
      window.dispatchEvent(new CustomEvent("trigger-on-default", { bubbles: true, composed: true }));
      expect(__firedEvents._triggerOnDefault).toBe(true);
    });

    it("still respects listenAt:on parent", () => {
      frag.dispatchEvent(new CustomEvent("trigger-on-listen-at", { bubbles: true }));
      expect(__firedEvents._triggerOnListenAt).toBe(true);
    });
  });

  describe("decorators", () => {
    describe("eventsListenAt", () => {
      it("can be used on the class in place of the static eventsListenAtProperty", () => {
        const el = fixture(html`<events-listen-at-descriptor></events-listen-at-descriptor>`);
        window.dispatchEvent(new CustomEvent("trigger-on-default", { bubbles: true, composed: true }));
        expect(__firedEvents._triggerOnDefault).toBe(true);
        el.restore();
      });

      it("can stop immediate propagation", () => {
        const el = fixture(html`<events-listen-at-descriptor></events-listen-at-descriptor>`);
        const event = new CustomEvent("trigger-on-default", { bubbles: true, composed: true });
        const spy = jest.spyOn(event, "stopImmediatePropagation");
        window.dispatchEvent(event);
        expect(spy).toBeCalled();
        spy.mockRestore();
        el.restore();
      });
    });

    describe("event", () => {
      it("can be used on a method to define an event handler", () => {
        const el = fixture(html`<event-descriptor></event-descriptor>`);
        const event = new CustomEvent("trigger-on-default", { bubbles: true, composed: true });
        window.dispatchEvent(event);
        expect(__firedEvents._triggerOnDefault).toBe(true);
        el.restore();
      });
      
      it("can be used on a method to define an event handler and change the listenAt", () => {
        const el = fixture(html`<event-descriptor></event-descriptor>`);
        el.dispatchEvent(new CustomEvent("trigger-on-listen-at", { bubbles: true, composed: true }));
        expect(__firedEvents._triggerOnListenAt).toBe(true);
        el.restore();
      });

      it("can stop immediate propagation", () => {
        const el = fixture(html`<event-descriptor></event-descriptor>`);
        const event = new CustomEvent("trigger-on-listen-at", { bubbles: true, composed: true });
        const spy = jest.spyOn(event, "stopImmediatePropagation");
        el.dispatchEvent(event);
        expect(spy).toBeCalled();
        spy.mockRestore();
        el.restore();
      });
    });

    describe("Middleware", () => {
      it("can apply middleware", () => {
        __firedEvents = {};
        EventMap.applyMiddleware((handlerInfo:EventMapHandlerInfo) => (next:Function) => () => {
          expect(handlerInfo.eventName).toBe("event-to-trigger");
          expect(handlerInfo.constructorName).toBe("EventMapTest1");
          expect(handlerInfo.eventHandlerName).toBe("_toTrigger");
          next();
        });
  
        const frag = fixture(test1Html);
        const child = frag.querySelector("#child") as RestorableElement;
        const event = new CustomEvent('event-to-trigger', { bubbles: true, composed: true });      
        expect(__firedEvents._toTrigger).toBeUndefined();
        child.dispatchEvent(event);
        expect(__firedEvents._toTrigger).toBe("triggered");
        frag.restore();
        __firedEvents = {};
        EventMap.clearMiddleware();
      });   
    });
  });


  describe("multiple handlers", () => {

    beforeEach(function () {
      __firedEvents = {};
    });

    it("handles both event types", () => {
      __firedEvents.handler1Count = 0;
      const el = fixture(html`<event-map-multiple-handlers></event-map-multiple-handlers>`);
      el.dispatchEvent(new CustomEvent("handle-first-event"));
      expect(__firedEvents.handler1Count).toBe(1);
      el.dispatchEvent(new CustomEvent("handle-second-event"));
      expect(__firedEvents.handler1Count).toBe(2);
      el.restore();
    });

    it("removes both handlers", () => {
      const el = fixture(html`<event-map-multiple-handlers></event-map-multiple-handlers>`);
      __firedEvents.handler1Count = 0;
      el.dispatchEvent(new CustomEvent("handle-first-event"));
      expect(__firedEvents.handler1Count).toBe(1);
      el.dispatchEvent(new CustomEvent("handle-second-event"));
      expect(__firedEvents.handler1Count).toBe(2);
      el.restore();
      el.dispatchEvent(new CustomEvent("handle-first-event"));
      expect(__firedEvents.handler1Count).toBe(2);
      el.dispatchEvent(new CustomEvent("handle-second-event"));
      expect(__firedEvents.handler1Count).toBe(2);
    });
  });



  // add test for event and eventsListenAt decorators
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
    },
    "event-to-test-stop-propagation": {
      listenAt: "parent",
      handler: "_testStopPropagation",
      stopPropagation: false
    }
  };
  _toTrigger() {
      __firedEvents._toTrigger = "triggered";
  }
  _toTestParent() {
    __firedEvents._toTrigger = "triggeredOnParent";
  }
  _toTestWindow() {
    __firedEvents._toTrigger = "triggeredOnWindow";
  }
  _testStopPropagation() {
    __firedEvents._toTrigger = "testStopPropagation";
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
let MixedInEvents = (superclass:any) => class extends EventMap(superclass) {
  static events = {
    "stomped-event": "_stompedEvent",
    "mixed-in-event": "_mixedInEvent"
  };
  _stompedEvent() {
      throw new Error("This handler should not be called");
  }
  _mixedInEvent() {
      __firedEvents._mixedInEvent = true;
  }
};

/**
 * A class to test mixed in events
 */
/**@ts-ignore TS2417 */
class ElementWithMixedInEvents extends MixedInEvents(HTMLElement) {
  static events = {
    "stomped-event": "_stompedEvent",
    "normal-event": "_normalEvent"
  };
  _stompedEvent() {
      __firedEvents._stompedEvent = true;
  }
  _normalEvent() {
      __firedEvents._normalEvent = true;
  }
}
/** @ts-ignore TS2345 */
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
      __firedEvents._triggerOnDefault = true;
  }
  _triggerOnListenAt() {
      __firedEvents._triggerOnListenAt = true;
  }
}
customElements.define("default-listen-at", DefaultListenAt);


@eventsListenAt("window", {
  stopImmediatePropagation: true
})
class EventsListenAtDescriptor extends EventMap(HTMLElement) {
  static events = {
      "trigger-on-default": "_triggerOnDefault",
  };
  _triggerOnDefault() {
      __firedEvents._triggerOnDefault = true;
  }
}
customElements.define("events-listen-at-descriptor", EventsListenAtDescriptor);


@eventsListenAt("window")
class EventDescriptor extends EventMap(HTMLElement) {

  @event("trigger-on-default")
  _triggerOnDefault() {
      __firedEvents._triggerOnDefault = true;
  }

  @event("trigger-on-listen-at", {listenAt: "parent", stopImmediatePropagation: true})
  _triggerOnListenAt() {
    __firedEvents._triggerOnListenAt = true;
  }
}
customElements.define("event-descriptor", EventDescriptor);



class MultipleHandlers extends EventMap(HTMLElement) {
  @event("handle-first-event")
  @event("handle-second-event")
  handler1() {
    __firedEvents.handler1Count++;
  }
}
customElements.define("event-map-multiple-handlers", MultipleHandlers);

