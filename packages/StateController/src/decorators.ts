import { StateController } from "./StateController";


interface EventClass {
    eventType:string;
}


export const windowEvent = (eventClass:EventClass) =>
    (controller:StateController, propertyKey:string) => 
        eventDecorator(window, eventClass, controller, propertyKey);



export const hostEvent = (eventClass:EventClass) =>
    (controller:StateController, propertyKey:string) => 
        eventDecorator(controller.host, eventClass, controller, propertyKey);



const eventDecorator = (eventTarget:EventTarget, eventClass:EventClass, controller:StateController, propertyKey:string) => {
    controller.hostConnected = new Proxy(controller.hostConnected, {
        apply: (hostConnected, thisArg, args) => {
            eventTarget.addEventListener(eventClass.eventType, async (event:Event) => {
                await controller[propertyKey](event);
            }, {
                signal: controller.abortController.signal
            } as EventListenerOptions);
            return hostConnected();
        }
    });
};


export const trackState = () =>
    (target: StateController, propertyKey: string) => {
        target.trackState(propertyKey);
    };