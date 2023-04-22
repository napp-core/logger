import { ILogAttr, ILogItem, OLogFactory } from "./common";
import { LogLevel } from "./level";
import { ILogWriter } from "./writer";



interface ICanLog {
    (level: LogLevel): boolean
}


interface HLogMessage {
    (l: (msg: string) => LogItem): LogItem


}
interface HLogMessageOpt {

    tracing?: string;
    attrs?: ILogAttr
    tags?: string[]

    errors?: Error[];


}
interface OLogger extends OLogFactory {

    parent?: Logger;
}


class LogItem {


    private timestamp = Date.now();
    private _tracing?: string;
    private _attr?: ILogAttr;
    private _tags?: string[];
    private _errors?: Error[];

    constructor(private logger: Logger, private level: LogLevel, private logname: string, private message: string) {
    }

    attr(p: { [k: string]: Object }) {
        this._attr = { ...(this._attr || {}), ...p };
        return this;
    }
    tracing(id: string) {
        this._tracing = id;
        return this;
    }

    exeption(...err: Error[]) {
        this._errors = [...(this._errors || []), ...err]
        return this;
    }

    tag(...tags: string[]) {
        this._tags = [...(this._tags || []), ...tags]
        return this;
    }

    getData(): ILogItem {


        return {
            timestamp: this.timestamp,
            level: this.level,
            logname: this.logname,
            message: () => this.message,
            tracing: () => this._tracing,
            attrs: () => {
                let lattr = this.logger.attr;
                let mattr = this._attr;
                if (mattr || lattr) {
                    return { ...(lattr || {}), ...(mattr || {}) }
                }

                return undefined;
            },
            tags: () => {
                let ltags = this.logger.tags;
                let mtags = this._tags;

                if (ltags || mtags) {
                    let tags = [...(ltags || []), ...(mtags || [])]
                    return [...new Set<string>(tags)]
                }
                return undefined;
            },
            errors: () => {
                return this._errors;
            }
        }
    }

}

export class Logger {


    constructor(private logname: string, private canLog: ICanLog, private writer: ILogWriter, private opt: OLogger) {

    }

    fatal(h: HLogMessage | string, opt?: HLogMessageOpt) {
        return this.log(LogLevel.fatal, h, opt);
    }

    error(h: HLogMessage | string, opt?: HLogMessageOpt) {
        return this.log(LogLevel.error, h, opt);
    }
    warn(h: HLogMessage | string, opt?: HLogMessageOpt) {
        return this.log(LogLevel.warn, h, opt);
    }
    info(h: HLogMessage | string, opt?: HLogMessageOpt) {
        return this.log(LogLevel.info, h, opt);
    }
    debug(h: HLogMessage | string, opt?: HLogMessageOpt) {
        return this.log(LogLevel.debug, h, opt);
    }
    

    action<T>(actionName: string, message: string, handle: () => T, opt?: {

        level?: {
            success?: LogLevel;
            fail?: LogLevel;
            request?: LogLevel;
        }
        tags?: string[],
        attr?: ILogAttr
    }) {
        try {
            this.log(opt?.level?.request || LogLevel.debug, msg => {
                let m = msg(message);
                if (opt?.attr) {
                    m.attr(opt?.attr)
                }
                if (opt?.tags) {
                    m.tag(...opt?.tags)
                }
                return m.tag(`${actionName}.request`)
            })
            let r: T = handle()

            this.log(opt?.level?.success || LogLevel.info, msg => {
                let m = msg(message);
                if (opt?.attr) {
                    m.attr(opt?.attr)
                }
                if (opt?.tags) {
                    m.tag(...opt?.tags)
                }
                return m.tag(`${actionName}.success`)
            })

            return r;
        } catch (error) {
            this.log(opt?.level?.fail || LogLevel.error, msg => {
                let m = msg(message);
                if (error instanceof Error) {
                    m.exeption(error)
                }
                if (opt?.attr) {
                    m.attr(opt?.attr)
                }
                if (opt?.tags) {
                    m.tag(...opt?.tags)
                }
                return m.tag(`${actionName}.fail`)
            })
            throw error;
        }
    }

    f(h: HLogMessage | string, opt?: HLogMessageOpt) {
        return this.fatal(h, opt);
    }
    e(h: HLogMessage | string, opt?: HLogMessageOpt) {
        return this.error(h, opt);
    }
    w(h: HLogMessage | string, opt?: HLogMessageOpt) {
        return this.warn(h, opt);
    }
    i(h: HLogMessage | string, opt?: HLogMessageOpt) {
        return this.info(h, opt);
    }
    d(h: HLogMessage | string, opt?: HLogMessageOpt) {
        return this.debug(h, opt);
    }
  
    log(level: LogLevel, handler: HLogMessage | string, opt?: HLogMessageOpt) {

        let can = this.canLog(level);

        if (can) {
            if (typeof handler === 'function') {
                let item = handler((msg: string) => new LogItem(this, level, this.logname, msg));
                return this.writer(item.getData())
            }

            let item = new LogItem(this, level, this.logname, handler);
            if (opt?.tracing) {
                item.tracing(opt.tracing)
            }
            if (opt?.attrs) {
                item.attr(opt.attrs)
            }
            if (opt?.errors) {
                item.exeption(...opt.errors)
            }
            if (opt?.tags) {
                item.tag(...opt.tags)
            }

            return this.writer(item.getData())
        }
    }



    child(logname: string, opt?: OLogFactory) {
        return new Logger(`${this.logname}.${logname}`, this.canLog, this.writer, {
            parent: this,
            attr: opt?.attr,
            tags: opt?.tags,
        })
    }


    get tags(): string[] | undefined {
        if (this.opt.parent) {
            return [... (this.opt.parent.tags || []), ...(this.opt.tags || [])]
        }
        return this.opt.tags;
    }
    get attr(): ILogAttr | undefined {
        if (this.opt.parent && this.opt.attr) {
            return { ... (this.opt.parent.attr || {}), ...(this.opt.attr || {}) }
        }
        if (this.opt.parent) {
            return this.opt.parent.attr
        }
        return this.opt.attr;
    }

}