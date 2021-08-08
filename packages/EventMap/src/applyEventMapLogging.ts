import {EventMap, EventMapHandlerInfo} from "./EventMap";
import {Logger} from "@harbr/middleware";
export { applyEventMapLogging };


const applyEventMapLogging = (
    {collapsed}:{collapsed:boolean} = {collapsed:false}) => EventMap.applyMiddleware(
    (handlerInfo:EventMapHandlerInfo) =>
    (next:Function) => () => {        
    const el = handlerInfo.element;
    const detail:any = handlerInfo.eventDetail || "(none)";

    Logger.log(el, collapsed? "groupCollapsed": "group",
        `> EVENTMAP: ${handlerInfo.listenAt}@${handlerInfo.eventName} => ` +
        `${handlerInfo.constructorName}.${handlerInfo.eventHandlerName}()`);

    Logger.log(el, "info", `=> event.detail`, detail);
    next();
    Logger.log(el, "groupEnd");
});
