export { Logger, loggerConfig }

let logOnly = false;


class Logger {
  static log(obj, level, ...args) {
    const {__loggerConfig:config} = obj.constructor;
    
    if (logOnly && (!config || !config.onlyThis)) {
      return;
    }

    const logLevel = (config && config.level) || level;
    if (level === "groupEnd" && logLevel !== level) {
      return;
    }
    console[logLevel](...args);
  }
}


const loggerConfig = ({onlyThis = false, level}) => {
  return (ctor) => {
    if (onlyThis) {
      logOnly = true;
      console.warn(`Logger only logging set for ${ctor.name}`);
    }
    ctor.__loggerConfig = {onlyThis, level};
  };
};