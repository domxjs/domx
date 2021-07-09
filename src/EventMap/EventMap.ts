import { Logger } from "../Logger/Logger.js";
export { EventMap, eventsListenAt, event };

/**
 * A CustomElement class mixin which supports attaching and detaching DOM events declaratively.
 * @param {HTMLElement} superclass 
 */
const EventMap = (superclass : HTMLElement) => class extends superclass {
    
   /** adds event listeners */
    connectedCallback() {
      super.connectedCallback && super.connectedCallback();

      // keep the map from being processed more than once.
      // if mixed in more than once
      if (!this.__eventMapProcessed) {
        this._bindEvents();
        this.__eventMapProcessed = true;
      }        
    }

    /** removes event listners */
    disconnectedCallback() {
      super.disconnectedCallback && super.disconnectedCallback();
      this._unbindEvents();
      delete this.__eventMapProcessed;
    }

    _bindEvents() { 
      this.__eventMapHandlers = {};
      const constructorName = this.constructor.name;
      const events = getAllEvents(this);     
      if (!events) {
        return;
      }

      Object.keys(events).forEach((key) => {
        // support a string or object
        const detail = events[key];

        if (!this[detail.handler]) {
          throw new Error(`EventMap method does not exist: ${detail.handler}`);
        }

        const listenAt = (detail.listenAt) === "window" 
            ? window 
            : (detail.listenAt) === "parent" 
                ? this.parentNode 
                : (!detail.listenAt || detail.listenAt === "this") 
                    ? this 
                    : null;

        if (!listenAt) {
          throw new Error(`EventMap could not set up a listener at ${detail.listenAt}`); // jch! add test
        }

        // The handler logs the event, stops propagation, and calls the assigned event handler
        const handler = (event) => {
          const eventHandler = this[detail.handler];
          const listenAtName = listenAt.constructor.name === "ShadowRoot" ?
            listenAt.host.constructor.name : listenAt.constructor.name;
          
          Logger.log(this, "group", `> EVENTMAP: ${listenAtName}@${key} => ${constructorName}.${eventHandler.name}()`);
          Logger.log(this, "info", (`=> event.detail`, event.detail || "(none)"));
          event.stopPropagation();
          eventHandler.call(this, event);
          Logger.log(this, "groupEnd");
        };        

        this.__eventMapHandlers[key] = {
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


const getAllEvents = (el) => {
  const eventMaps = [];
  let ctor = el.constructor;

  while (ctor.prototype) {
    if (ctor.events) {            
      const listenAt = ctor.eventsListenAt || null;
      const events = Object.keys(ctor.events).reduce((events, eventName) => {                
        const handlerOrDef = ctor.events[eventName];
        events[eventName] = typeof handlerOrDef === "string" ?
          { listenAt, handler: handlerOrDef} :
          handlerOrDef                                      
        return events;
      }, {});
      eventMaps.unshift(events);
    }
    ctor = Object.getPrototypeOf(ctor.prototype.constructor);
  }
  return eventMaps.length > 0 ? Object.assign(...eventMaps) : null;
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