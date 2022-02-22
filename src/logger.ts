import { ILogAttr, ILogItem, ILogMessage, OLogFactory } from "./common";
import { LogLevel } from "./level";
import { LogLiner } from "./line";
import { ILogLinerWriter, ILogWriter } from "./writer";



interface ICanLog {
    (level: LogLevel): boolean
}


interface HLogMessage {
    (l: LogItem): LogItem
}
interface OLogger extends OLogFactory {

    parent?: Logger;
}


class LogItem {
    private _data: ILogItem;
    constructor(level: LogLevel, logname: string) {
        this._data = { timestamp: Date.now(), level, logname }
    }
    message(msg: ILogMessage) {
        if (typeof msg === 'function') {
            this._data.message = () => msg(this._data);
        } else {
            this._data.message = () => '' + msg;
        }

        return this;
    }
    attr(p: { [k: string]: Object }) {
        this._data.attr = { ...(this._data.attr || {}), ...p };
        return this;
    }

    exeption(...err: Error[]) {
        this._data.errors = [...(this._data.errors || []), ...err]
        return this;
    }

    tag(...tag: string[]) {
        this._data.tags = [...(this._data.tags || []), ...tag]
        return this;
    }

    get data() {
        return this._data;
    }

}

export class Logger {


    constructor(private logname: string, private canLog: ICanLog, private writer: ILogWriter, private lineWriter: ILogLinerWriter, private opt: OLogger) {

    }

    fatal(h: HLogMessage) {
        return this.log(LogLevel.fatal, h);
    }

    error(h: HLogMessage) {
        return this.log(LogLevel.error, h);
    }
    warn(h: HLogMessage) {
        return this.log(LogLevel.warn, h);
    }
    info(h: HLogMessage) {
        return this.log(LogLevel.info, h);
    }
    debug(h: HLogMessage) {
        return this.log(LogLevel.debug, h);
    }
    trace(h: HLogMessage) {
        return this.log(LogLevel.trace, h);
    }

    async action<T>(actionName: string, message: ILogMessage, handle: () => Promise<T>, opt?: {
       
        level?: {
            success?: LogLevel;
            fail?: LogLevel;
            request?: LogLevel;
        }
        tags?: string[],
        attr?: ILogAttr
    }) {
        try {
            this.log(opt?.level?.request || LogLevel.trace, m => {
                if (opt?.attr) {
                    m.attr(opt?.attr)
                }
                if (opt?.tags) {
                    m.tag(...opt?.tags)
                }
                return m.message(message).tag(`${actionName}.request`)
            })
            let r: T = await handle()

            this.log(opt?.level?.success || LogLevel.info, m => {
                if (opt?.attr) {
                    m.attr(opt?.attr)
                }
                if (opt?.tags) {
                    m.tag(...opt?.tags)
                }
                return m.message(message).tag(`${actionName}.success`)
            })

            return r;
        } catch (error) {
            this.log(opt?.level?.fail || LogLevel.error, m => {
                if (error instanceof Error) {
                    m.exeption(error)
                }
                if (opt?.attr) {
                    m.attr(opt?.attr)
                }
                if (opt?.tags) {
                    m.tag(...opt?.tags)
                }
                return m.message(message).tag(`${actionName}.success`)
            })
            throw error;
        }
    }

    f(h: HLogMessage) {
        return this.fatal(h);
    }
    e(h: HLogMessage) {
        return this.error(h);
    }
    w(h: HLogMessage) {
        return this.warn(h);
    }
    i(h: HLogMessage) {
        return this.info(h);
    }
    d(h: HLogMessage) {
        return this.debug(h);
    }
    t(h: HLogMessage) {
        return this.trace(h);
    }
    log(level: LogLevel, handler: HLogMessage) {

        let lmer = (() => {
            let lm: LogItem | null = null;
            return () => {
                if (lm) {
                    return lm;
                }
                lm = handler(new LogItem(level, this.logname));
                return lm;
            }
        })();

        let can = this.canLog(level);

        if (can) {
            this.writer(lmer().data)
        }

        let logline = this.logLine;
        if (logline && level <= logline.lowLevel) {
            this.lineWriter(lmer().data, logline.wnames)
        }
    }



    child(logname: string, opt?: {
        logLine?: LogLiner;
        attr?: ILogAttr;
        tags?: string[];
    }) {
        return new Logger(`${this.logname}.${logname}`, this.canLog, this.writer, this.lineWriter, {
            parent: this,
            attr: opt?.attr,
            tags: opt?.tags,
            logLine: opt?.logLine,
        })
    }


    get tags() {
        return this.opt.tags || []
    }
    get attr() {
        return this.opt.attr || {}
    }
    get logLine() {
        return this.opt.logLine
    }
}