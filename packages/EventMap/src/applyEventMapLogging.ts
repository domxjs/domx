import {EventMap, EventMapHandlerInfo} from "./EventMap";
import {Logger} from "@plotmap/middleware";
export { applyEventMapLogging };

let isApplied = false;


const applyEventMapLogging = (
    {collapsed}:{collapsed:boolean} = {collapsed:false}) => {
        if (isApplied) {
            console.warn("applyEventMapLogging has already been called.");
            return;
        }
        isApplied = true;
        
        EventMap.applyMiddleware(
            (handlerInfo:EventMapHandlerInfo) =>
            (next:Function) => () => {     

            const el = handlerInfo.element;
            const detail:any = handlerInfo.eventDetail || "(none)";
            debugger;
            Logger.log(el, collapsed ? "groupCollapsed": "group",
                `> EVENTMAP: ${handlerInfo.listenAt}@${handlerInfo.eventName} => ` +
                `${handlerInfo.constructorName}.${handlerInfo.eventHandlerName}()`);

            Logger.log(el, "info", `=> event.detail`, detail);
            next();
            Logger.log(el, "groupEnd");
        }
    )
};

/**
 * Exposed for testing
 */
applyEventMapLogging.reset = () => {
    isApplied = false;
};
