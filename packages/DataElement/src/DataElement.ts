export {
    customDataElements,
    customDataElement,
    DataElement
};


class DataElement extends HTMLElement {
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
