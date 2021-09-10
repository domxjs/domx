import { EventMap, event, EventMapListenAt } from "@domx/eventmap";
import { Middleware } from "@domx/middleware";
export {
    customDataElements,
    customDataElement,
    DataElement,
    DataElementCtor,
    DataElementMetaData,
    dataProperty,
    event
};
import { RootState } from "./RootState";



/** Add custom element methods to HTMLElement */
declare global {
    interface HTMLElement {
        connectedCallback(): void;
        disconnectedCallback(): void;
    }
}

/** Defines the static fields of a DataElement */
interface DataElementCtor extends Function {
    __elementName: string,
    dataProperties: DataProperties;
    stateIdProperty: string
}

/** Generic object key index accessor */
interface StringKeyIndex<T> { [key:string]:T }

/** The static DataProperties as defined on the DataElement */
interface DataProperties extends StringKeyIndex<DataProperty> {}

interface DataProperty {
    changeEvent?: string
}

/** DataProperty MetaData parsed per stateId */
interface DataPropertiesMetaData extends StringKeyIndex<DataPropertyMetaData> {}

interface DataPropertyMetaData {
    changeEvent: string,
    statePath: string,
    windowEventName: string,
    localEventHandler: EventListener,
    windowEventHandler: EventListener
}

interface DataElementMetaData {
    elementName: string,
    element: DataElement,
    dataProperties: DataPropertiesMetaData
};

/**
 * Used to keep track of how many data elements
 * are using the same state key.
 */
const stateRefs:StringKeyIndex<number> = {};

const connectedMiddleware = new Middleware();
const disconnectedMiddleware = new Middleware();

/**
 * Base class for data elements.
 */
class DataElement extends EventMap(HTMLElement) {
    static eventsStopImmediatePropagation = true;
    static __elementName = "data-element";
    static stateIdProperty:string = "stateId";
    static dataProperties:DataProperties = {
        state: {changeEvent:"state-changed"}
    };

    static applyMiddlware(connectedFn:Function, disconnectedFn: Function) {
        connectedMiddleware.use(connectedFn);
        disconnectedMiddleware.use(disconnectedFn);
    }

    static clearMiddleware() {
        connectedMiddleware.clear();
        disconnectedMiddleware.clear();
    }

    __isConnected = false;
    __dataPropertyMetaData:DataPropertiesMetaData = {};
    
    connectedCallback() {
        super.connectedCallback && super.connectedCallback();
        elementConnected(this); 
    }

    disconnectedCallback() {
        super.disconnectedCallback && super.disconnectedCallback();
        elementDisconnected(this);
    }

    /**
     * Resets the state and dispatches the changes;
     * useful when changing the stateId property.
     * @param states {StateMap} the key is the name of
     * the state property, and the value is the state to set it to
     */
    refreshState(states:{[key:string]:object}) {
        const dp = (this.constructor as DataElementCtor).dataProperties;
        Object.keys(states).forEach((stateName) => {
            const thisEl = this as unknown as {[key:string]:object};
            const changeEvent = dp[stateName].changeEvent as string;
            thisEl[stateName] = states[stateName];
            this.dispatchEvent(new CustomEvent(changeEvent, {
                detail: {isSyncUpdate: true}
            }));
        });

        if (this.__isConnected === true) {
            elementDisconnected(this);
            elementConnected(this); 
        }
    }

    /**
     * Dispatches a change event on this DataElement.
     * @param prop {string} the name of the property to dispatch the change event on; default is "state"
     */
    dispatchChange(prop:string = "state") {
        const dp = this.__dataPropertyMetaData;
        this.dispatchEvent(new CustomEvent(dp[prop].changeEvent as string));
    }
}

/**
 * Custom DataElement Registry
 */
const customDataElements = {
    /**
     * Defines the custom element with window.customElements.define
     * and tags the element name for use in RootState.
     * @param elementName {string}
     * @param element {CustomElementConstructor}
     */
    define: (elementName:string, element:CustomElementConstructor) => {
        setProp(element, "__elementName", elementName);
        window.customElements.define(elementName, element);
    }
};


interface CustomDataElementOptions {
    /** Sets which property is to be used as the stateId; default: stateId */
    stateIdProperty?: string,
    /** Sets the default event listener element for events; default: "self" */
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
    options.stateIdProperty && setProp(ctor, "stateIdProperty", options.stateIdProperty);
    options.eventsListenAt && setProp(ctor, "eventsListenAt", options.eventsListenAt);
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
    (prototype: any, propertyName: string) =>
        (prototype.constructor as DataElementCtor).dataProperties[propertyName] = {
            changeEvent: options ? options.changeEvent : `${propertyName}-changed`
        };


const elementConnected = (el:DataElement) => {
    const ctor = el.constructor as DataElementCtor;
        
    const stateId = getProp(el, ctor.stateIdProperty);
    const stateIdPath = stateId ? `.${stateId}` : "";

    Object.keys(ctor.dataProperties).forEach((propertyName) => {

        // determine the statePath and window event name
        const statePath = `${ctor.__elementName}.${propertyName}${stateIdPath}`;
        const windowEventName = `${statePath}-changed`;
        
        // set/update the change event
        const dp = ctor.dataProperties[propertyName];
        const changeEvent = dp.changeEvent || `${propertyName}-changed`;
        ctor.dataProperties[propertyName] = { changeEvent };

        // add to the stateRefs
        stateRefs[statePath] = stateRefs[statePath] ? stateRefs[statePath] + 1 : 1;

        // define the local event handler to push changes to RootState 
        // and other elements with the same statePath
        const localEventHandler = ((event: CustomEvent) => {
            if (event.detail?.isSyncUpdate !== true) {
                RootState.set(statePath, getProp(el, propertyName));
                triggerGlobalEvent(el, windowEventName);
            }
        }) as EventListener;

        // define the global event handler
        const windowEventHandler = (event: Event) => {
            if (getProp<any>(event, "detail")?.sourceElement !== el) {
                setProp(el, propertyName,RootState.get(statePath));
                triggerSyncEvent(el, changeEvent);
            }
        };        

        // store the meta data on the element
        el.__dataPropertyMetaData[propertyName] = {
            statePath,
            changeEvent,
            localEventHandler,
            windowEventHandler,
            windowEventName
        };

        // set initial state
        const initialState = RootState.get(statePath);
        if (initialState === null) {
            RootState.set(statePath, getProp<object>(el, propertyName));
        } else {
            setProp(el, propertyName, initialState);
            triggerSyncEvent(el, changeEvent);
        }

        // add the event handlers
        el.addEventListener(changeEvent, localEventHandler);
        window.addEventListener(windowEventName, windowEventHandler);
    });    
    connectedMiddleware.mapThenExecute(getMiddlewareMetaData(el), () => {}, []);
    el.__isConnected = true;
};

const getMiddlewareMetaData = (el:DataElement):DataElementMetaData => {
    const ctor = el.constructor as DataElementCtor;
    const metaData:DataElementMetaData = {
        elementName: ctor.__elementName,
        element: el,
        dataProperties: el.__dataPropertyMetaData
    };
    return metaData;
};


const triggerSyncEvent = (el:DataElement, changeEvent:string) =>
    el.dispatchEvent(new CustomEvent(changeEvent, {detail:{isSyncUpdate:true}}));

const triggerGlobalEvent = (el: DataElement, changeEvent:string) =>
    window.dispatchEvent(new CustomEvent(changeEvent, {detail: {sourceElement:el}}))


/**
 * Decrements each data properties state path reference.
 * If 0, then removes the state from RootState.
 * Also removes the window event handler
 * @param el {DataElement}
 */
const elementDisconnected = (el:DataElement) => {
    const dpmd = el.__dataPropertyMetaData;
    Object.keys(dpmd).forEach((propertyName) => {
        const dp = el.__dataPropertyMetaData[propertyName];
        const statePath = dp.statePath;
        const changeEvent = dp.changeEvent;
        stateRefs[statePath] = stateRefs[statePath] - 1;
        stateRefs[statePath] === 0 && RootState.delete(statePath);
        el.removeEventListener(changeEvent, dp.localEventHandler);
        window.removeEventListener(dp.windowEventName, dp.windowEventHandler);
        dp.windowEventHandler = (event:Event) => {}
        dp.localEventHandler = (event:Event) => {}
    });
    disconnectedMiddleware.mapThenExecute(getMiddlewareMetaData(el), () => {}, []);
    el.__isConnected = false;
};


/** Helper for getting dynamic properties */
const getProp = <T>(obj:object, name:string):T => {
    //@ts-ignore TS7053 access dynamic property
    return obj[name] as T;
};


/** Helper for setting dyanmic properties */
const setProp = <T>(obj:object, name:string, value:T) => {
    //@ts-ignore TS7053 access dynamic property
    obj[name] = value;
};