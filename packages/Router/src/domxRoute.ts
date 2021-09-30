import { DomxRoute } from "./domx-route";
import { Logger } from "@domx/middleware/Logger";
import { Route } from "./Router";
export { monitorParentRoute, appendElement }

/*
 * A utility module for route elements.
 */
interface RouteElement extends HTMLElement {
    parentRoute:Route|null,
    element: string|null,
    appendTo: string
}

/**
 * Sets up a listener on the parentElement routes tail if
 * it is a DomxRoute element; returns a function to 
 * be called to remove the listener.
 * @param routeEl {RouteElement}
 * @param removeMonitor {Function}
 * @returns {Function}
 */
const monitorParentRoute = (
    routeEl:RouteElement,
    removeMonitor:Function|null):Function|null => {

    const parentEl = routeEl.parentElement;
    if (!parentEl || parentEl instanceof DomxRoute === false) {
        return null;
    }

    removeMonitor?.();

    const updateParent = () => {
        const { tail } = parentEl as DomxRoute;
        routeEl.parentRoute = tail;
        Logger.log(routeEl, "debug", `Route: set parentRoute: ${routeEl.element} ` +
            `${tail ? `prefix: ${tail.prefix}, path: ${tail.path}` : `null`}`);
    };
    parentEl.addEventListener("tail-changed", updateParent);
    updateParent();
    return () => {
        parentEl.removeEventListener("tail-changed", updateParent);
    }
};

/**
 * Appends the element to the DOM according to the
 * route elements appendTo property.
 * @param route {RouteElement}
 * @param el {HTMLElement}
 */
const appendElement = (route:{appendTo:string} & HTMLElement, el:HTMLElement) => {
    let root = route.getRootNode();
    root = root === document ? document.body : root;
    if (route.appendTo === "parent") {            
        root.appendChild(el);
    } else if(route.appendTo === "body") {
        document.body.appendChild(el);                
    } else {
        (<Element>root).querySelector(route.appendTo)?.appendChild(el);
    }
};

