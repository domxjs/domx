import {EventMapHandlerInfo} from "./EventMap";
export { applyEventMapLogging };


const applyEventMapLogging = (handlerInfo: EventMapHandlerInfo) => () => {
    
    console.log(handlerInfo, event, eventHandler);
};


/*
BEFORE NEXT
Logger.log(this, "group", `> EVENTMAP: ${listenAtName}@${key} => ${constructorName}.${eventHandler.name}()`);
Logger.log(this, "info", (`=> event.detail`, event.detail || "(none)", handlerInfo));

AFTER NEXT
Logger.log(this, "groupEnd");
*/
        