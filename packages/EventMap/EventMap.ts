//@ts-ignore

import { Logger } from "@harbor/middleware/Logger";
export {
  EventMap,
  eventsListenAt,
  event,
  EventMapListenAt
};


/** 
 * Generic constructor type
 */
type GenericConstructor<T = {}> = new (...args: any[]) => T;


/**
 * Used for setting the HTMLElement as a base class constraint
 */
type HTMLElementType = GenericConstructor<HTMLElement>;


interface EventMapCtor {
  prototype: Object,
  eventsListenAt? : EventMapListenAt,
  events?: EventMapCtorEvents
}

interface EventMapCtorEvents {
  [key: string]: string | EventMapHandlerDetail
}

interface EventMapHandlers {
  [key: string]: EventMapHandlerDetail
}

interface EventMapHandlerDetail {
  listenAt: EventMapListenAt,
  handler: string | Function
}

enum EventMapListenAt {
  Self = "self",
  Parent = "parent",
  Window = "window"
}

/**
 * Middleware information when an event
 * handler is called.
 * e.g. window@some-event -> class.handler -> detail
 */
interface EventMapHandlerInfo {
  class: object,
  listenAt: EventMapListenAt,
  eventName: string,
  constructorName: string,
  eventHandlerName: string,
  eventDetail?: object
}



/**
 * An HTMLElement class mixin which supports attaching
 * and detaching DOM events declaratively.
 * @param {HTMLElement} superclass 
 */
 function EventMap<TBase extends HTMLElementType>(Base: TBase) {
  return class EventMap extends Base {

    __eventMapProcessed? : boolean;
    __eventMapHandlers? : EventMapCtorEvents;
    
   /** Attaches event listeners */
    connectedCallback() {
      super.connectedCallback && super.connectedCallback();

      // keep the map from being processed more than once.
      // if mixed in more than once
      if (!this.__eventMapProcessed) {
        this._bindEvents();
        this.__eventMapProcessed = true;
      }        
    }

    /** Removes event listners */
    disconnectedCallback() {
      super.disconnectedCallback && super.disconnectedCallback();
      this._unbindEvents();
      delete this.__eventMapProcessed;
    }

    _bindEvents() { 
      this.__eventMapHandlers = {};
      const constructorName = this.constructor.name;
      const events = getAllEvents(this.constructor);     
      if (!events) {
        return;
      }

      Object.keys(events).forEach((key) => {
        const detail = events[key] as EventMapHandlerDetail;

        // @ts-ignore dynamic access of method
        const eventHandler = this[detail.handler] as Function;

        if (!eventHandler) {
          throw new Error(`EventMap method does not exist: ${detail.handler}`);
        }

        const listenAt = ((detail.listenAt) === EventMapListenAt.Window
            ? window 
            : (detail.listenAt) === EventMapListenAt.Parent
                ? this.parentNode 
                : (!detail.listenAt || detail.listenAt === EventMapListenAt.Self) 
                    ? this 
                    : null); // as Node;

        if (!listenAt) {
          throw new Error(`EventMap could not set up a listener at ${detail.listenAt}`); // jch! add test
        }

        // The handler logs the event, stops propagation, and calls the assigned event handler
        const handler = (event: CustomEvent) => {
          const listenAtName = listenAt.constructor.name === "ShadowRoot" ?
            listenAt.host.constructor.name : listenAt.constructor.name;
          
          const handlerInfo : EventMapHandlerInfo = {
            class: this,
            listenAt: listenAtName,
            eventName: key,
            constructorName,
            eventHandlerName: eventHandler.name,
            eventDetail: event.detail
          }

          // listenAt, eventName, constructorName, eventHandlerName, eventDetail
          Logger.log(this, "group", `> EVENTMAP: ${listenAtName}@${key} => ${constructorName}.${eventHandler.name}()`);
          Logger.log(this, "info", (`=> event.detail`, event.detail || "(none)", handlerInfo));
          event.stopPropagation();
          eventHandler.call(this, event);
          Logger.log(this, "groupEnd");
        };        

        this.__eventMapHandlers?[key] = {
          listenAt: listenAt,
          handler: handler
        };

        listenAt.addEventListener(key, handler);
      });
    }

    _unbindEvents() {
        const handlers = this.__eventMapHandlers;
        if (!handlers) {
            return;
        }

        Object.keys(handlers).forEach((key) => {
            let info = handlers[key];
            info.listenAt.removeEventListener(key, info.handler);
        });

        delete this.__eventMapHandlers;
    }
  };
}


/**
 * Combines and expands events from all constructors
 * in the chain.
 * @param ctor {EventMapCtor}
 * @returns {EventMapCtorEvents}
 */
const getAllEvents = (ctor: EventMapCtor): EventMapCtorEvents | null => {
  const eventMaps : Array<EventMapCtorEvents> = [];

  while (ctor.prototype) {
    if (ctor.events) {            
      const listenAt = ctor.eventsListenAt || EventMapListenAt.Self;
      const token : EventMapCtorEvents = {}
      const events = Object.keys(ctor.events).reduce((events, eventName: string) => {                
        const handlerOrDef = ctor.events ? ctor.events[eventName] : "";
        events[eventName] = typeof handlerOrDef === "string" ?
          { listenAt, handler: handlerOrDef} :
          handlerOrDef                                      
        return events;
      }, token);
      eventMaps.unshift(events);
    }
    ctor = Object.getPrototypeOf(ctor.prototype.constructor);
  }

  return eventMaps.length > 0 ? Object.assign({}, ...eventMaps) : null;
};


/**
 * A method decorator to define an event handler.
 * @param {String} eventName 
 * @param {Object?} options an object to define the listenAt property
 */
const event = (eventName, {listenAt} = {}) => {
  return (prototype, handler, descriptor) => {
    const {events = {}} = prototype.constructor;
    listenAt ? events[eventName] = { listenAt, handler} :
      events[eventName] = handler;
    prototype.constructor.events = events;
  };
};

/**
 * A class decorator to define the default
 * eventsListenAt static property.
 * @param {String} listenAt
 */
const eventsListenAt = (listenAt) => {
  return (ctor) => {
    ctor.eventsListenAt = listenAt;
  };
};