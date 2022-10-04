import { EventMapListenAt } from "@domx/eventmap";
import { customDataElements, DataElement, DataElementCtor } from "./DataElement";
export { customDataElement, dataProperty }
export { event } from "@domx/eventmap/decorators";
export { EventMapListenAt }


interface CustomDataElementOptions {
    /** Sets which property is to be used as the stateId; default: stateId */
    stateIdProperty?: string,
    /**
     * Sets the default event listener element for events;
     * can be "self", "parent", or "window";
     * default: "self"
     */
    eventsListenAt?: EventMapListenAt|string
}

/**
 * A class decorator that defines the custom element with
 * `window.customElements.define` and tags the element name
 * for use in RootState.
 * 
 * Options allow for setting `stateIdProperty` and `eventsListenAt`.
 * @param elementName {string}
 * @param options {CustomDataElementOptions}
 */
const customDataElement = (elementName:string, options:CustomDataElementOptions={}) =>
    (ctor: CustomElementConstructor) => {
    if (options.stateIdProperty) {
        (ctor as any)["stateIdProperty"] = options.stateIdProperty;
    }
    if (options.eventsListenAt) {
        (ctor as any)["eventsListenAt"] = options.eventsListenAt;
    }
    customDataElements.define(elementName, ctor);
};




interface DataPropertyOptions {
    changeEvent:string
}
/**
 * A property decorator that tags a class property
 * as a state property.
 * 
 * Options allow for setting the change event name.
 * @param options 
 */
const dataProperty = (options?:DataPropertyOptions):any =>
    (prototype: any, propertyName: string) => {
        if (prototype.constructor.dataProperties === DataElement.dataProperties) {
            prototype.constructor.dataProperties = {};
        }
        (prototype.constructor as DataElementCtor).dataProperties[propertyName] = {
            changeEvent: options ? options.changeEvent : `${propertyName}-changed`
        };
    };

