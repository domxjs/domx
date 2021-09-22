import { Middleware } from "@domx/middleware/Middleware";
import "./decorators";
export {
  EventMap,
  EventMapEvent,
  EventMapListenAt,
  EventMapHandlerInfo,
  ProcessedEventMapDefinition,
  EventMapPropagation,
  EventMapMixin
};


/**
 * Describes the properties looked for by 
 * the EventMap mixin.
 */
 interface EventMapMixin {
  prototype: Object,
  eventsListenAt? : EventMapListenAt,
  eventsStopPropagation?: boolean,
  eventsStopImmediatePropagation?: boolean,
  events?: EventMapDefinition
}

/**
 * The available settings for the default
 * object to set event listeners on.
 * If not set, Self is the default.
 */
 enum EventMapListenAt {
  Self = "self",
  Parent = "parent",
  Window = "window"
}

interface EventMapPropagation {
  stopPropagation?: boolean,
  stopImmediatePropagation?: boolean
}

/**
 * Interface for the event decorator
 */
interface EventMapEvent extends EventMapPropagation {
  listenAt: EventMapListenAt|string
}

/**
 * The strucutre of the static events 
 * property to be read by the EventMap mixin.
 */
interface EventMapDefinition {
  /**
   * The key is the name of the event to listen. The
   * value can be the name of the method to bind to or
   * an object containing handler and listenAt properties.
   */
  [key: string]: string | EventMapDefinitionItem
}

interface EventMapDefinitionItem extends EventMapPropagation {
  /** The object to set the event listener on */
  listenAt: EventMapListenAt,
  /** The name of the event handler method */
  handler: string
}

interface ProcessedEventMapDefinition {
  [key: string]: ProcessedEventMapDefinitionItem
}

interface ProcessedEventMapDefinitionItem extends EventMapPropagation  {
  listenAt: EventMapListenAt | Node | Window,
  handler: string | EventListener
}


/**
 * Middleware information when an event
 * handler is called.
 */
interface EventMapHandlerInfo {
  /** The class that is mixed in */
  element: HTMLElement,
  listenAt: EventMapListenAt,
  eventName: string,
  constructorName: string,
  eventHandlerName: string,
  eventDetail?: object
}

/** 
 * Generic constructor type
 */
 type GenericConstructor<T = {}> = new (...args: any[]) => T;


 /**
  * Used for setting the HTMLElement as a base class constraint
  */
 type HTMLElementType = GenericConstructor<HTMLElement>;


declare global {
  interface HTMLElement {
      connectedCallback(): void;
      disconnectedCallback(): void;
  }
}


const middleware = new Middleware();

/**
 * An HTMLElement class mixin which supports attaching
 * and detaching DOM events declaratively.
 * @param {HTMLElement} superclass 
 */
 function EventMap<TBase extends HTMLElementType>(Base: TBase) {

  // @ts-ignore TS2339 dynamically setting static property
  Base.eventsStopPropagation = Base.eventsStopPropagation === undefined ? true :  Base.eventsStopPropagation;
  return class EventMap extends Base {

    __eventMapProcessed? : boolean;
    __eventMapHandlers? : ProcessedEventMapDefinition;
    
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
      const events = getAllEvents(this.constructor);     
      if (!events) {
        return;
      }

      Object.keys(events).forEach((key) => {
        const detail = events[key];

        // @ts-ignore TS2538 dynamic access of method
        const eventHandler = this[detail.handler] as Function;
        if (!eventHandler) {
          throw new Error(`EventMap method does not exist: ${detail.handler}`);
        }

        const listenAt = getListenAt({listenAt: detail.listenAt, element: this});
        if (!listenAt) {
          throw new Error(`EventMap could not set up a listener at ${detail.listenAt}`);
        }

        const handler = getHandler({listenAt, element: this, eventName:key, eventHandler, detail});

        /* @ts-ignore TS2488 setting dynamic property */
        this.__eventMapHandlers[key] = {
          listenAt,
          handler: handler
        };

        listenAt.addEventListener(key, handler);
      });
    }

    _unbindEvents() {
        const handlers = this.__eventMapHandlers || {};
        Object.keys(handlers).forEach((key) => {
            const info = handlers[key] as ProcessedEventMapDefinitionItem;
            (info.listenAt as Node | Window).removeEventListener(key, info.handler as EventListener);
        });

        delete this.__eventMapHandlers;
    }
  };
}

/**
 * Exposes middleware
 * @param fn {Function}
 */
EventMap.applyMiddleware = (fn: Function) => {
  middleware.use(fn);
};


/**
 * Removes all middleware associated with
 * the EventMap.
 */
EventMap.clearMiddleware = () => {
  middleware.clear();
};


/**
 * Combines and expands events from all constructors
 * in the chain.
 * @param ctor {EventMapMixin}
 * @returns {Array<ProcessedEventMapDefinition>}
 */
const getAllEvents = (ctor: EventMapMixin): ProcessedEventMapDefinition | null => {
  const eventMaps : Array<ProcessedEventMapDefinition> = [];

  while (ctor.prototype) {
    if (ctor.events) {            
      const events = Object.keys(ctor.events).reduce((events, eventName: string) => {                
        events[eventName] = getEventMapDefinitionItem(ctor, ctor.events?.[eventName] || "");
        return events;
      }, {} as ProcessedEventMapDefinition);
      eventMaps.unshift(events);
    }
    ctor = Object.getPrototypeOf(ctor.prototype.constructor);
  }

  return eventMaps.length > 0 ? Object.assign({}, ...eventMaps) : null;
};


const getEventMapDefinitionItem = (ctor:EventMapMixin, def:EventMapDefinitionItem|string) 
  :EventMapDefinitionItem => {
    const di = typeof def === "string" ? {handler:def} as EventMapDefinitionItem : def;
    return {
      ...di,
      listenAt: di.listenAt === undefined ?
        ctor.eventsListenAt || EventMapListenAt.Self : di.listenAt,
      stopPropagation: di.stopPropagation === undefined ?
        ctor.eventsStopPropagation : di.stopPropagation,
      stopImmediatePropagation: di.stopImmediatePropagation === undefined ?
        ctor.eventsStopImmediatePropagation : di.stopImmediatePropagation,
    };
};


interface ListenAtInfo {
  listenAt: EventMapListenAt | Node | Window,
  element: HTMLElement,
}

/**
 * Returns the node to attach the event listener to.
 * @param listenAtInfo {ListenAtInfo}
 * @returns {Window|Node}
 */
const getListenAt = ({listenAt, element}:ListenAtInfo) => listenAt === EventMapListenAt.Window
    ? window 
    : listenAt === EventMapListenAt.Parent
        ? element.parentNode 
        : (!listenAt || listenAt === EventMapListenAt.Self) 
            ? element 
            : null;


interface HandlerInfo extends ListenAtInfo {
  eventName: string,
  eventHandler: Function,
  detail: ProcessedEventMapDefinitionItem
}

/**
 * The handler logs the event, stops propagation, and calls the assigned event handler
 * @param handlerInfo {HandlerInfo}
 * @returns EventListener
 */
const getHandler = ({listenAt, element, eventName, eventHandler, detail}:HandlerInfo):EventListener => {
  const handler: EventListener = (event: Event) => {

    const listenAtName = listenAt.constructor.name === "ShadowRoot" ?
      // @ts-ignore TS2339 - provided check for ShadowRoot
      listenAt.host.constructor.name : listenAt.constructor.name;
    
    const handlerInfo : EventMapHandlerInfo = {
      element,
      listenAt: listenAtName,
      eventName,
      constructorName: element.constructor.name,
      eventHandlerName: eventHandler.name,
      // @ts-ignore TS2339 EventListener only takes Event and not CustomEvent
      eventDetail: event.detail
    };

    middleware.mapThenExecute(handlerInfo, () => {
      detail.stopImmediatePropagation === true ?
        event.stopImmediatePropagation() :
        detail.stopPropagation === true ?
          event.stopPropagation() : false;

      eventHandler.call(element, event);
    }, [event, eventHandler]);
  };

  return handler;
}
