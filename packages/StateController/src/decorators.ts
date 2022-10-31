import { StateController } from "./StateController";


interface EventClass {
    eventType:string;
}


export const windowEvent = (eventClass:EventClass) =>
    (controllerClass:StateController, propertyKey:string) => 
        eventDecorator("window", eventClass, controllerClass, propertyKey);



export const hostEvent = (eventClass:EventClass) =>
    (controllerClass:StateController, propertyKey:string) => 
        eventDecorator("host", eventClass, controllerClass, propertyKey);



const eventDecorator = (eventTarget:string, eventClass:EventClass,
    controllerClass:StateController, propertyKey:string) => {
        controllerClass.hostConnected = new Proxy(controllerClass.hostConnected, {
            apply: (hostConnected, thisArg:StateController, args) => {
                (eventTarget === "window" ? window : thisArg.host)
                    .addEventListener(eventClass.eventType, async (event:Event) => {
                        thisArg[propertyKey](event);
                }, {
                    signal: thisArg.abortController.signal
                } as EventListenerOptions);
                return hostConnected.apply(thisArg);
            }
        });
    };


export const trackState = () =>
    (target: StateController, propertyKey: string) => {
        if (!target.stateProperties) {
            target.stateProperties = new Array();
        }
        target.stateProperties.push(propertyKey);
    };