import { StateController } from "./StateController";


interface EventClass {
    eventType:string;
}

interface IEventHandlerOptions { 
    /** set this option to false to not have `stopImmediatePropagation` from being called on the event */
    capture: boolean
}

export const windowEvent = (eventClass:EventClass, options?:IEventHandlerOptions) =>
    (controllerClass:StateController, propertyKey:string) => 
        eventDecorator("window", eventClass, controllerClass, propertyKey, options);



export const hostEvent = (eventClass:EventClass, options?:IEventHandlerOptions) =>
    (controllerClass:StateController, propertyKey:string) => 
        eventDecorator("host", eventClass, controllerClass, propertyKey, options);



const eventDecorator = (eventTarget:string, eventClass:EventClass,
    controllerClass:StateController, propertyKey:string, options?:IEventHandlerOptions) => {
        controllerClass.hostConnected = new Proxy(controllerClass.hostConnected, {
            apply: (hostConnected, thisArg:StateController, args) => {
                (eventTarget === "window" ? window : thisArg.host)
                    .addEventListener(eventClass.eventType, async (event:Event) => {
                        if (!options || !options.capture === false) {
                            event.stopImmediatePropagation();
                        }
                        thisArg.refreshState();
                        thisArg[propertyKey](event);
                }, {
                    signal: thisArg.abortController.signal
                } as EventListenerOptions);
                return hostConnected.apply(thisArg);
            }
        });
    };


export const stateProperty = () =>
    (target: StateController, propertyKey: string) => {
        const ctor = target.constructor as typeof StateController;
        if (ctor.stateProperties === StateController.stateProperties) {
            // shadow the static state properties field
            ctor.stateProperties = [];
        }
        ctor.stateProperties.push(propertyKey);
    };