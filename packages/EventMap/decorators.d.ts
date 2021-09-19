import { EventMapEvent, EventMapListenAt, EventMapMixin, EventMapPropagation } from "./EventMap";
export { eventsListenAt, event };
/**
 * A method decorator to define an event handler.
 * @param {String} eventName
 * @param {EventMapEvent?} options an object to define the listenAt property
 * @returns {EventMapDefinitionItem}
 */
declare const event: (eventName: string, options?: EventMapEvent | undefined) => (prototype: any, handler: string) => void;
/**
* A class decorator to define the default
* eventsListenAt static property.
* @param {EventMapListenAt|string} listenAt
*/
declare const eventsListenAt: (listenAt: EventMapListenAt | string, options?: EventMapPropagation | undefined) => (ctor: EventMapMixin) => void;
//# sourceMappingURL=decorators.d.ts.map