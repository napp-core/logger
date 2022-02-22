import { Eventer } from "./event";

export enum LoggerLevel {
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4
}

interface LoggerHandle {
    (): string | [string] | [string, object]
}

type LoggerMessage = string | [string, object] | LoggerHandle

export interface LoggerWriter {
    (logname: string, level: LoggerLevel, message: string, params?: object): void
}
interface IWrie {
    logname: string, level: LoggerLevel, message: string, params?: object
}
interface IDoWriter {
    (onlog: Eventer<IWrie>, logname: string, level: LoggerLevel, handle: LoggerMessage): void
}

export interface ILogger {
    debug(handle: string | LoggerHandle, params?: object): void;

    info(handle: string | LoggerHandle, params?: object): void;
    warn(handle: string | LoggerHandle, params?: object): void;

    error(handle: string | LoggerHandle, params?: object): void;

    log(level: LoggerLevel, handle: string | LoggerHandle, params?: object): void;
}
export class Logger implements ILogger {

    onlog = new Eventer<IWrie>();
    //OnLog = new Subject<{ level: LoggerLevel, message: string, params?: object }>();
    constructor(private logname: string, private doWrite: IDoWriter) {

    }
    debug(handle: string | LoggerHandle, params?: object) {
        return this.log(LoggerLevel.DEBUG, handle, params);
    }

    info(handle: string | LoggerHandle, params?: object) {
        return this.log(LoggerLevel.INFO, handle, params);
    }
    warn(handle: string | LoggerHandle, params?: object) {
        return this.log(LoggerLevel.WARN, handle, params);
    }

    error(handle: string | LoggerHandle, params?: object) {
        return this.log(LoggerLevel.ERROR, handle, params);
    }

    log(level: LoggerLevel, handle: string | LoggerHandle, params?: object) {
        if (typeof handle === 'function') {
            return this.doWrite(this.onlog, this.logname, level, handle);
        }

        if (params) {
            return this.doWrite(this.onlog, this.logname, level, [handle, params]);
        }
        return this.doWrite(this.onlog, this.logname, level, handle);
    }
}

export class LoggerCollection implements ILogger {

    private loggers = new Array<ILogger>();

    constructor(...loggers: ILogger[]) {
        this.loggers.push(...loggers);
    }

    add(...loggers: ILogger[]) {
        this.loggers.push(...loggers);
        return this;
    }

    debug(handle: string | LoggerHandle, params?: object) {
        this.loggers.map(l => l.debug(handle, params));
    }

    info(handle: string | LoggerHandle, params?: object) {
        this.loggers.map(l => l.info(handle, params));
    }
    warn(handle: string | LoggerHandle, params?: object) {
        this.loggers.map(l => l.warn(handle, params));
    }

    error(handle: string | LoggerHandle, params?: object) {
        this.loggers.map(l => l.error(handle, params));
    }

    log(level: LoggerLevel, handle: string | LoggerHandle, params?: object) {
        this.loggers.map(l => l.log(level, handle, params));
    }
}

export namespace LoggerManager {

    const _logs: { [logname: string]: Logger } = {}
    const _writers: { [logname: string]: LoggerWriter } = {}
    const _levels: { [logname: string]: LoggerLevel } = {}
    const _default: { level: LoggerLevel, writer: LoggerWriter } = {
        level: LoggerLevel.INFO,
        writer: (logname, level, msg, params) => {
            console.log(`[${logname}]`, `${LoggerLevel[level]}:`, msg, params);
        }
    }

    function write(onlog: Eventer<IWrie>, logname: string, level: LoggerLevel, handle: LoggerMessage) {
        const loglevel = getLoglevel(logname);
        if (level >= loglevel) {
            let writer = getLogwriter(logname);

            if (typeof handle === 'function') {
                let resp = handle();

                if (Array.isArray(resp)) {
                    if (resp.length == 1) {
                        let message = resp[0];

                        onlog.emit({ logname, level, message });
                        return writer(logname, level, message);
                    }
                    if (resp.length == 2) {
                        let message = resp[0];
                        let params = resp[1];
                        onlog.emit({ logname, level, message, params });
                        return writer(logname, level, message, params);
                    }
                }

                onlog.emit({ logname, level, message: resp });
                return writer(logname, level, resp);
            }

            if (Array.isArray(handle) && handle.length == 2) {
                let message = handle[0];
                let params = handle[1];
                onlog.emit({ logname, level, message, params });
                return writer(logname, level, message, params);
            }

            onlog.emit({ logname, level, message: handle });
            return writer(logname, level, handle);

        }
    }

    export function getLogger(logname: string) {
        if (logname in _logs) {
            return _logs[logname];
        }
        _logs[logname] = new Logger(logname, write);

        return _logs[logname];
    }

    export function setLogwriter(logname: string, writer: LoggerWriter) {
        _writers[logname] = writer;
    }
    export function getLogwriter(logname: string) {
        if (logname in _writers) {
            return _writers[logname];
        }
        return _default.writer;
    }
    export function setLoglevel(logname: string, level: LoggerLevel) {
        _levels[logname] = level;
    }

    export function getLoglevel(logname: string) {
        if (logname in _levels) {
            return _levels[logname];
        }
        return _default.level
    }
    
    export function setDefaultLevel(level: LoggerLevel) {
        _default.level = level;
    }
    export function setDefaultwriter(writer: LoggerWriter) {
        _default.writer = writer;
    }


    export function parseLoggerLevel(level: string) {

        let l = (level || '').toLowerCase();
        if (l) {
            if (['i', 'info', 'notice'].indexOf(l) > -1) {
                return LoggerLevel.INFO;
            }

            if (['w', 'warn', 'warning', 'alert'].indexOf(l) > -1) {
                return LoggerLevel.WARN;
            }
            if (['d', 'debug', 'trace'].indexOf(l) > -1) {
                return LoggerLevel.DEBUG;
            }
            if (['e', 'error', 'critical', 'fatal'].indexOf(l) > -1) {
                return LoggerLevel.ERROR;
            }

            console.warn('cannot parse LoggerLevel from ', level)
        }
        return LoggerLevel.INFO;
    }

    export function factoryLogger(logname: string, writer: LoggerWriter) {
        const logger = getLogger(logname);
        setLogwriter(logname, writer);
        return logger;
    }
}

// export function setDefaultwriter(writer: LoggerWriter) {
//     return LoggerManager.setDefaultwriter(writer);
// }
// export function setDefaultLevel(level: LoggerLevel) {
//     return LoggerManager.setDefaultLevel(level);
// }
export function getLogger(logname: string) {
    return LoggerManager.getLogger(logname);
}

export {
    Eventer
}