import {EventMapEvent, EventMapListenAt, EventMapMixin, EventMapPropagation } from "./EventMap";
export { 
    eventsListenAt,
    event
}

/**
 * A method decorator to define an event handler.
 * @param {String} eventName 
 * @param {EventMapEvent?} options an object to define the listenAt property
 * @returns {EventMapDefinitionItem}
 */
 const event = (eventName: string, options?:EventMapEvent) =>
 (prototype: any, handler: string) => {
   const {events = {}} = prototype.constructor;
   events[eventName] = {
     ...events[eventName],
     listenAt: options?.listenAt,
     stopPropagation: options?.stopPropagation,
     stopImmediatePropagation: options?.stopImmediatePropagation,
     handler
   };
   prototype.constructor.events = events;
 };


/**
* A class decorator to define the default
* eventsListenAt static property.
* @param {EventMapListenAt|string} listenAt
*/
const eventsListenAt = (listenAt: EventMapListenAt|string, options?: EventMapPropagation) =>
 (ctor: EventMapMixin) => {
   ctor.eventsListenAt = listenAt as EventMapListenAt;
   if (options) {
     ctor.eventsStopPropagation = options.stopPropagation;
     ctor.eventsStopImmediatePropagation = options.stopImmediatePropagation;
   }
 };