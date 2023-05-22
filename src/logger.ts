import { ILogAttr, ILogItem, OLogFactory } from "./common";
import { LogLevel } from "./level";
import { ILogWriter } from "./writer";



interface ICanLog {
    (level: LogLevel): boolean
}

export class LogBuilder {
    message?: string;
    track?: string;
    attrs?: ILogAttr
    tags?: string[]
    errors?: any[];

    addTag(...tags: string[]) {
        this.tags = [... new Set<string>([...(this.tags || []), ...tags])]
        return this;
    }
    addError(...errors: any[]) {
        this.errors = [...(this.errors || []), ...errors]
        return this;
    }

    setAttr(attr: ILogAttr) {
        this.attrs = {
            ... (this.attrs || {}),
            ...attr
        }
        return this;
    }

    setTrack(track: string) {
        this.track = track;
        return this
    }

    setMessage(msg: string) {
        this.message = msg;
        return this;
    }
}





interface LogParamEx {
    (e: LogBuilder): void
}






interface OLogger extends OLogFactory {

    parent?: Logger;
}




export class Logger {


    constructor(private logname: string, private canLog: ICanLog, private writer: ILogWriter, private opt: OLogger) {

    }

    fatal(msg: string, opt?: LogParamEx) {
        return this.log(LogLevel.fatal, msg, opt);
    }
    fatalFn(fn: LogParamEx) {
        return this.logFn(LogLevel.fatal, fn);
    }
    error(msg: string, opt?: LogParamEx) {
        return this.log(LogLevel.error, msg, opt);
    }
    errorFn(fn: LogParamEx) {
        return this.logFn(LogLevel.error, fn);
    }
    warn(msg: string, opt?: LogParamEx) {
        return this.log(LogLevel.warn, msg, opt);
    }
    warnFn(fn: LogParamEx) {
        return this.logFn(LogLevel.warn, fn);
    }
    info(msg: string, opt?: LogParamEx) {
        return this.log(LogLevel.info, msg, opt);
    }
    infoFn(fn: LogParamEx) {
        return this.logFn(LogLevel.info, fn);
    }
    debug(msg: string, opt?: LogParamEx) {
        return this.log(LogLevel.debug, msg, opt);
    }
    debugFn(fn: LogParamEx) {
        return this.logFn(LogLevel.debug, fn);
    }
    trace(msg: string, opt?: LogParamEx) {
        return this.log(LogLevel.trace, msg, opt);
    }
    traceFn(fn: LogParamEx) {
        return this.logFn(LogLevel.trace, fn);
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
            this.logFn(opt?.level?.request || LogLevel.debug, e => {
                e.message = message;
                e.attrs = opt?.attr;
                if (opt?.tags) {
                    e.addTag(...opt.tags)
                }
                e.addTag(`${actionName}.request`);
            })
            let r: T = handle()

            this.logFn(opt?.level?.success || LogLevel.info, e => {
                e.message = message;
                e.attrs = opt?.attr;
                if (opt?.tags) {
                    e.addTag(...opt.tags)
                }
                e.addTag(`${actionName}.success`);
            })

            return r;
        } catch (error) {
            this.logFn(opt?.level?.fail || LogLevel.error, e => {
                e.message = message;
                e.attrs = opt?.attr;
                e.addTag(`${actionName}.fail`);
                if (opt?.tags) {
                    e.addTag(...opt.tags)
                }
                if (error instanceof Error) {
                    e.errors = [error]
                }
            })
            throw error;
        }
    }

    f(msg: string, opt?: LogParamEx) {
        return this.fatal(msg, opt);
    }
    e(msg: string, opt?: LogParamEx) {
        return this.error(msg, opt);
    }
    w(msg: string, opt?: LogParamEx) {
        return this.warn(msg, opt);
    }
    i(msg: string, opt?: LogParamEx) {
        return this.info(msg, opt);
    }
    d(msg: string, opt?: LogParamEx) {
        return this.debug(msg, opt);
    }
    t(msg: string, opt?: LogParamEx) {
        return this.trace(msg, opt);
    }

    log(level: LogLevel, message: string, opt?: LogParamEx) {
        let can = this.canLog(level);
        if (can) {
            let p = new LogBuilder().setMessage(message)
            if (opt) {
                opt(p)
            }

            this._log(level, p)
        }
    }
    private _log(level: LogLevel, p: LogBuilder) {
        let log: ILogItem = {
            timestamp: Date.now(),
            logname: this.logname,
            level,
            message: p.message,
            attrs: (p.attrs || this.attr)
                ? { ...(this.attr || {}), ...(p.attrs || {}) }
                : undefined,
            errors: p.errors,
            tags: (p.tags || this.tags)
                ? [... new Set<string>([...(this.tags || []), ...(p.tags || [])])]
                : undefined,
            track: p.track
        }

        this.writer(log);

    }
    logFn(level: LogLevel, fn: LogParamEx) {
        let can = this.canLog(level);
        if (can) {

            let p = new LogBuilder()

            fn(p);

            this._log(level, p)

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