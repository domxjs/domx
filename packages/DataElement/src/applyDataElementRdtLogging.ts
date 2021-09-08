import {DevToolsEventData,DevToolsExtension,DevToolsInstance} from "./rdtTypes";
import { RootState } from "./RootState";
import { DataElement, DataElementCtor, DataElementMetaData } from "./DataElement";
import { StateChange, StateChangeMetaData } from "@domx/statechange";
export { applyDataElementRdtLogging }


/**
 * Redux Dev Tools Middleware
 * 
 * Docs:
 * https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Methods.md
 * 
 * Set logChangeEvents to false if using StateChange and
 * do not want the duplicate state entry.
 * @param options {RdtLoggingOptions}
 */
const applyDataElementRdtLogging = (options:RdtLoggingOptions = {logChangeEvents:true}) => {
    if (isApplied || hasDevTools() === false) {
        return;
    }

    isApplied = true;
    logChangeEvents = options.logChangeEvents;
    DataElement.applyMiddlware(connectedCallback, disconnectedCallback);
    StateChange.applyNextMiddleware(stateChangeNext);
};

let isApplied = false;
let logChangeEvents = true;

interface RdtLoggingOptions {
    logChangeEvents: boolean
}

/** 
 * Used to keep track of all the connected elements in the DOM
 * so we can update their state from dev tools
 * The key is the statePath.
 **/
interface ConnectedElements {
    [key:string]: Array<ConnectedDataElement>
}

interface ConnectedDataElement {
    element: DataElement,
    property: string,
    changeEvent: string
};

const connectedElements:ConnectedElements = {};

const connectedCallback = (metaData:DataElementMetaData) => (next:Function) => () => {

    const el = metaData.element;
    Object.keys(metaData.dataProperties).forEach((propertyName) => {
        const dp = metaData.dataProperties[propertyName];
        const statePath = dp.statePath as string;
        const changeEvent = dp.changeEvent as string;
        
        // update the connected elements
        connectedElements[statePath] = connectedElements[statePath] || [];
        connectedElements[statePath].push({
            element: el,
            changeEvent,
            property: propertyName
        });

        sendStateToDevTools(el, propertyName, statePath);
        logChangeEvents && el.addEventListener(changeEvent, (event:Event) => {
            sendStateToDevTools(el, propertyName, statePath);
        });        
    });

    next();
};

const sendStateToDevTools = (el:DataElement, propertyName:string, statePath:string) => {
    // @ts-ignore TS7053 getting indexed property
    const nextState = el[propertyName] as object;
    getDevToolsInstance().send(statePath, RootState.draft(statePath, nextState));
};

const disconnectedCallback = (metaData:DataElementMetaData) => (next:Function) => () => {
    const el = metaData.element;
    Object.keys(metaData.dataProperties).forEach((propertyName) => {
        // update the connected elements
        const dp = metaData.dataProperties[propertyName];
        const statePath = dp.statePath as string;
        const elIndex = connectedElements[statePath].findIndex(cde => cde.element === el);
        connectedElements[statePath].splice(elIndex, 1);
    });
    next();
};

const stateChangeNext = (stateChange:StateChange)  => (next:Function) => (state:any) => {
    const result = next(state);
    const meta = stateChange.meta;
    const ctor = meta.el.constructor as DataElementCtor
    const statePath = ctor.dataProperties[meta.property].statePath as string;
    getDevToolsInstance().send(getFnName(meta), RootState.draft(statePath, result));
    return result;
};

const getFnName = ({className, tapName, nextName}:StateChangeMetaData) => 
    `${className}.${tapName ? `${tapName}(${nextName})` : `${nextName}()`}`;


/**
 * True if the redux dev tools extension is installed
 * @returns {boolean}
 */
 const hasDevTools = ():boolean => (window as any).__REDUX_DEVTOOLS_EXTENSION__ !== undefined;


 /**
  * Returns the redux dev tools extension
  * @returns {DevToolsExtension}
  */
 const getDevTools = ():DevToolsExtension => (window as any).__REDUX_DEVTOOLS_EXTENSION__;
 
 
 /**
  * Pulls the connected dev tools instance from the HTML Element.
  * Creates it if it does not exist.
  * @param stateChange {StateChange}
  * @returns {DevToolsInstance}
  */
 let __rdt:DevToolsInstance|null = null;
 const getDevToolsInstance = ():DevToolsInstance => {
    __rdt = __rdt || setupDevToolsInstance(); 
    return __rdt as DevToolsInstance;
 };
 
 
 /**
  * Creates the dev tools istance and sets up the 
  * listener for dev tools interactions.
  * @returns DevToolsInstance
  */
 const setupDevToolsInstance = ():DevToolsInstance => {
     const dt = getDevTools().connect();
     dt.init(RootState.current);
     dt.subscribe(updateFromDevTools(dt));
     return dt;
 };


 const updateFromDevTools = (dt: DevToolsInstance) => (data:DevToolsEventData) => {
    if (isInit(data)) {
        return;
    }

    if (canHandleUpdate(data)) {
        RootState.init(JSON.parse(data.state));
        updateConnectedElements();        
    } else {
        dt.error(`DataElement RDT logging does not support payload type: ${data.type}:${data.payload.type}`);
    }
};

/**
 * Loops through connected elements and updates
 * their state properties and dispatches the sync change
 */
const updateConnectedElements = () => {
    Object.keys(connectedElements).forEach((statePath:string) => {
        const stateAtPath = RootState.get(statePath);
        connectedElements[statePath].forEach(({ property, changeEvent, element }) => {
            // @ts-ignore TS7053 setting indexed property
            element[property] = stateAtPath;
            element.dispatchEvent(new CustomEvent(changeEvent, {
                detail: {isSyncUpdate: true}
            }));
        });
    });
};
 
 
 /**
  * Returns true if the listener data is for initializing dev tools state.
  * @param data {DevToolsEventData}
  * @returns {boolean}
  */
 const isInit = (data:DevToolsEventData):boolean => 
     data.type === "START" || data.payload.type === "IMPORT_STATE";
 
 
 /**
  * Returns true if this middleware can handle the listener data.
  * @param data {DevToolsEventData}
  * @returns {boolean}
  */
 const canHandleUpdate = (data:DevToolsEventData):boolean =>
     data.type === "DISPATCH" && (
         data.payload.type === "JUMP_TO_ACTION" ||
         data.payload.type === "JUMP_TO_STATE"
     );

 
/**
 * Exposed for testing
 */
applyDataElementRdtLogging.reset = () => {
    isApplied = false;
};