import { ILogAttr, ILogItem, OLogFactory } from "./common";
import { LogLevel } from "./level";
import { ILogTrackWriter, ILogWriter } from "./writer";



interface ICanLog {
    (level: LogLevel): boolean
}


interface HLogMessage {
    (l: (msg: string) => LogItem): LogItem
}
interface OLogger extends OLogFactory {

    parent?: Logger;
}


class LogItem {


    private timestamp = Date.now();
    private _attr?: ILogAttr;
    private _tags?: string[];
    private _errors?: Error[];

    constructor(private logger: Logger, private level: LogLevel, private logname: string, private message: string) {
    }

    attr(p: { [k: string]: Object }) {
        this._attr = { ...(this._attr || {}), ...p };
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

    get data(): ILogItem {


        return {
            timestamp: this.timestamp,
            level: this.level,
            logname: this.logname,
            message: () => this.message,
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


    constructor(private logname: string, private canLog: ICanLog, private writer: ILogWriter, private trackWriter: ILogTrackWriter, private opt: OLogger) {

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
            this.log(opt?.level?.request || LogLevel.trace, msg => {
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

                lm = handler((msg: string) => new LogItem(this, level, this.logname, msg));
                return lm;
            }
        })();

        let can = this.canLog(level);

        if (can) {
            this.writer(lmer().data)
        }

        let track = this.tracker;
        if (track && level <= track.lowLevel) {
            this.trackWriter(lmer().data, track.wnames)
        }
    }



    child(logname: string, opt?: OLogFactory) {
        return new Logger(`${this.logname}.${logname}`, this.canLog, this.writer, this.trackWriter, {
            parent: this,
            attr: opt?.attr,
            tags: opt?.tags,
            tracker: opt?.tracker,
        })
    }


    get tags(): string[] | undefined {
        if (this.opt.parent) {
            return [... (this.opt.parent.tags || []), ...(this.opt.tags || [])]
        }
        return this.opt.tags;
    }
    get attr(): ILogAttr | undefined {
        if (this.opt.parent) {
            return { ... (this.opt.parent.attr || {}), ...(this.opt.attr || {}) }
        }
        return this.opt.attr;
    }
    get tracker() {
        return this.opt.tracker
    }
}