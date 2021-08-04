import {EventMap, EventMapHandlerInfo} from "./EventMap";
import {Logger} from "@harbor/middleware";
export { applyEventMapLogging };


const applyEventMapLogging = () => EventMap.applyMiddleware(
    (handlerInfo:EventMapHandlerInfo) =>
    (next:Function) => () => {        
    const el = handlerInfo.element;
    const detail:any = handlerInfo.eventDetail || "(none)";

    Logger.log(el,"group",
        `> EVENTMAP: ${handlerInfo.listenAt}@${handlerInfo.eventName} => ` +
        `${handlerInfo.constructorName}.${handlerInfo.eventHandlerName}()`);

    Logger.log(el, "info", `=> event.detail`, detail);
    next();
    Logger.log(el, "groupEnd");
});
