export { Logger, loggerConfig }


let logOnly = false;


enum ConsoleMethod {
  assert = "assert",
  clear = "clear",
  count = "count",
  countReset = "countReset",
  debug = "debug",
  dir = "dir",
  dirxml = "dirxml",
  error = "error",
  group = "group",
  groupCollapsed = "groupCollapsed",
  groupEnd = "groupEnd",
  info = "info",
  log = "log",
  profile = "profile",
  profileEnd = "profileEnd",
  table = "table",
  time = "time",
  timeEnd = "timeEnd",
  timeLog = "timeLog",
  timeStamp = "timeStamp",
  trace = "trace",
  warn = "warn"
}

interface LoggerConfig {
  onlyThis: boolean,
  level: ConsoleMethod
}


class Logger {
  static log(obj: object, level: ConsoleMethod | string, ...args: Array<any>) {
    
    const config = (obj.constructor as any).__loggerConfig;
    
    if (logOnly && (!config || !config.onlyThis)) {
      return;
    }

    const logLevel: ConsoleMethod = (config && config.level) || level;
    if (level === "groupEnd" && logLevel !== level) {
      return;
    }
    
    // @ts-ignore spreading args to console method
    console[logLevel](...args);
  }
}


const loggerConfig = ({
  onlyThis = false,
  level
}: LoggerConfig) => {
  return (ctor: any) => {
    if (onlyThis) {
      logOnly = true;
      console.warn(`Logger only logging set for ${ctor.name}`);
    }
    ctor.__loggerConfig = {onlyThis, level};
  };
};