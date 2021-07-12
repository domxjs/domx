/*
 * Provides utility methods for linking element properties and values
 * to other element properties via state paths.
 * 
 * This pattern can be copied to do more complex value binding
 * such as checkbox groups.
 */


/**
 * Links a property from a child to a property on the parent element.
 * @param {*} element The element to set the property on.
 * @param {string} prop The name of the property to link.
 * @param {string} [path=prop] The state path of the property to set.
 */
export const linkProp = (element, prop, path = null) => {
    path = path || prop;
    return (event) => {
        const fromEl = event.currentTarget;
        setPropertyPath(element, path, fromEl[prop]);
    };
};


export const linkSiblingProp = (host, querySelector, prop, path = null) => {
    path = path || prop;
    return (event) => {
        const fromEl = event.currentTarget;
        const elements = host.shadowRoot.querySelectorAll(querySelector);
        elements.forEach(element => setPropertyPath(element, path, fromEl[prop]));
    };
};

/**
 * Links the value property from a child to a property on the parent element.
 * @param {*} element The element to set the value on.
 * @param {string} path The state path of the property to set.
 */
export const linkVal = (element, path) => {
    return linkProp(element, "value", path);
};


/**
 * Links the checked property from a child to a property on the parent element.
 * @param {*} element 
 * @param {string} path The state path of the property to set.
 */
export const linkChecked = (element, path) => {
    return linkProp(element, "checked", path);
};


/**
 * Walks the state path from the element to set the value.
 * It clones any sub object to cause changes to be recognized.
 * @param {*} element 
 * @param {string} path 
 * @param {*} value 
 */
export const setPropertyPath = (element, path, value) => {
    const parts = path.split(".");
    
    parts.reduce((obj, part, index) => {
        const lastPartIndex = parts.length - 1;
        
        // if it is the last part, set the key
        if (index === lastPartIndex) {
            obj[part] = value;

        // otherwise clone the object or array and update the obj
        } else if (index < lastPartIndex) {
            const toClone = obj[part];
            toClone instanceof Array ?
                obj[part] = [...toClone] :
                obj[part] = Object.assign({}, toClone);
            obj = obj[part];
        }

        return obj;
    }, element);
};
