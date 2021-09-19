export { eventsListenAt, event };
/**
 * A method decorator to define an event handler.
 * @param {String} eventName
 * @param {EventMapEvent?} options an object to define the listenAt property
 * @returns {EventMapDefinitionItem}
 */
const event = (eventName, options) => (prototype, handler) => {
    const { events = {} } = prototype.constructor;
    events[eventName] = Object.assign(Object.assign({}, events[eventName]), { listenAt: options === null || options === void 0 ? void 0 : options.listenAt, stopPropagation: options === null || options === void 0 ? void 0 : options.stopPropagation, stopImmediatePropagation: options === null || options === void 0 ? void 0 : options.stopImmediatePropagation, handler });
    prototype.constructor.events = events;
};
/**
* A class decorator to define the default
* eventsListenAt static property.
* @param {EventMapListenAt|string} listenAt
*/
const eventsListenAt = (listenAt, options) => (ctor) => {
    ctor.eventsListenAt = listenAt;
    if (options) {
        ctor.eventsStopPropagation = options.stopPropagation;
        ctor.eventsStopImmediatePropagation = options.stopImmediatePropagation;
    }
};
//# sourceMappingURL=decorators.js.map