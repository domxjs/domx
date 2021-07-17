export {
    linkProp,
    linkSiblingProp,
    linkVal,
    linkChecked,
    setPropertyPath
}

/*
 * Provides utility methods for linking element properties and values
 * to other element properties via state paths.
 * 
 * This pattern can be copied to do more complex value binding
 * such as checkbox groups.
 */

interface IEventHandler {
     (event:Event): void
}


/**
 * Links a property from a child to a property on the parent element.
 * @param element {HTMLElement} The element to set the property on.
 * @param prop {string} The name of the property to link.
 * @param path {string|null} The state path of the property to set.
 * @returns IEventHandler
 */
const linkProp = (element: HTMLElement, prop: string, path: string|null = null):
    IEventHandler => {
    path = path || prop;
    return (event: Event) => {
        const fromEl = event.currentTarget;
        //@ts-ignore TS7053 getting dyanmic property
        const value: any = fromEl[prop];
        setPropertyPath(element, path as string, value);
    };
};


/**
 * Links a property between sibling HTML elements.
 * @param host {HTMLElement} The hosting element used to query the shadowRoot.
 * @param querySelector {string} The dom query for elements to set the value on.
 * @param prop {string} The name of the property to link.
 * @param path {string|null} The state path of the property to set.
 * @returns IEventHandler
 */
const linkSiblingProp = (
    host: HTMLElement,
    querySelector: string,
    prop: string,
    path: string|null = null
    ): IEventHandler => {
    path = path || prop;
    return (event: Event) => {
        const fromEl = event.currentTarget;
        const elements = host?.shadowRoot?.querySelectorAll(querySelector);
        //@ts-ignore TS7053 getting dyanmic property
        const value: any = fromEl[prop];
        elements && elements.forEach(element => setPropertyPath(element, path as string, value));
    };
};


/**
 * Links the value property from a child to a property on the parent element.
 * @param element {HTMLElement} The element to set the value on.
 * @param path {string|null} The state path of the property to set.
 * @returns IEventHandler
 */
const linkVal = (element: HTMLElement, path: string): IEventHandler => {
    return linkProp(element, "value", path);
};


/**
 * Links the checked property from a child to a property on the parent element.
 * @param element {HTMLElement} The element to set the checked attribute on.
 * @param path {string|null} The state path of the property to set.
 * @returns IEventHandler
 */
const linkChecked = (element: HTMLElement, path: string): IEventHandler => {
    return linkProp(element, "checked", path);
};


/**
 * Walks the state path from the element to set the value.
 * It clones any sub object to cause changes to be recognized.
 * @param element {Element} The element to set the value on.
 * @param path {string|null} The state path of the property to set.
 * @param value {any} The value to set.
 */
const setPropertyPath = (element: Element, path: string, value: any): void => {
    const parts = path.split(".");
    
    parts.reduce((obj, part, index) => {        
        const lastPartIndex = parts.length - 1;
        
        // if it is the last part, set the key
        if (index === lastPartIndex) {
            /* @ts-ignore TS7053 */
            obj[part] = value;

        // otherwise clone the object or array and update the obj
        } else if (index < lastPartIndex) {
            /* @ts-ignore TS7053 */
            const toClone = obj[part];
            
            toClone instanceof Array ?
                /* @ts-ignore TS7053 */
                obj[part] = [...toClone] :
                /* @ts-ignore TS7053 */
                obj[part] = Object.assign({}, toClone);

            /* @ts-ignore TS7053 */
            obj = obj[part];
        }

        return obj;
    }, element);
};
