export {
    customDataElements,
    customDataElement,
    DataElement,
    DataElementCtor
};

declare global {
    interface HTMLElement {
        connectedCallback(): void;
        disconnectedCallback(): void;
    }
}

/**
 * Defines the static fields of 
 * a DataElement
 */
interface DataElementCtor extends Function {
    __elementName: string,
    dataProperties: DataProperties;
    statIdProperty: string|null
}

interface DataProperties {
    [key:string]: DataProperty
}

interface DataProperty {
    changeEvent?: string
    statePath?: string
}


class DataElement extends HTMLElement {
    static __elementNaem = "";
    static stateIdProperty:string|null = null;
    static dataProperties:DataProperties = {
        state: {changeEvent:"state-changed"}
    };

    connectedCallback() {
        super.connectedCallback && super.connectedCallback();

        setUpDataProperties(this);

        // keep track of who is using state for each state path
        //->stateRefs[statePath] = stateRefs[statePath] ? stateRefs[statePath]+1 : 0;
        // decrease the ref count on disconnect and if 0 then delete the item from RootState

         // for each dataProperty set the initial state
         //->RootState.get(this)
         // if this is null then use the state property
         // on this element and set it in RootState
         // would need to do this for every data property.

         // Hook up global and local events (see below)
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
        //@ts-ignore TS2339 adding dynamic property.
        element.__elementName = elementName;
        window.customElements.define(elementName, element);
    }
};

/**
 * Defines the custom element with window.customElements.define
 * and tags the element name for use in RootState.
 * @param elementName {string}
 */
const customDataElement = (elementName:string) =>
    (element: CustomElementConstructor) =>
        customDataElements.define(elementName, element);


const setUpDataProperties = (el:DataElement) => {
    const ctor = el.constructor as DataElementCtor;
        
    //@ts-ignore TS7053 property index
    const stateId = ctor.stateIdProperty && el[ctor.stateIdProperty];

    const stateIdPath = stateId ? `.${stateId}` : "";
    Object.keys(ctor.dataProperties).map((propertyName) => {
        const dp = ctor.dataProperties[propertyName];
        ctor.dataProperties[propertyName] = {
            ...dp,
            changeEvent: dp.changeEvent || `${propertyName}-changed`,
            statePath: `${ctor.__elementName}.${propertyName}${stateIdPath}`
        }
    });

    // pass to middleware here
    // Middleware will have the dataProperties, elementName, and element
};