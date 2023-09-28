import { ILogAttr, ILogItem, OLogFactory, IError, IAttrValue } from "./common";
import { LogLevel } from "./level";
import { ILogWriter } from "./writer";



interface ICanLog {
    (level: LogLevel): boolean
}
function isObject(x: any): x is { [x: string]: IAttrValue } {
    return x && typeof x === 'object'
}
function isString(x: any): x is string {
    return (typeof x == 'string') || (x instanceof String)
}

function isStringArray(x: any): x is Array<string> {
    if (Array.isArray(x)) {
        return x.every(i => isString(i))
    }
    return false
}

function logAttrMerge(target: ILogAttr, source: ILogAttr) {


    if (!isObject(target) || !isObject(source)) {
        return source;
    }

    Object.keys(source).forEach(key => {
        const targetValue = target[key];
        const sourceValue = source[key];

        if (sourceValue === undefined) {
            return
        }
        if (isStringArray(targetValue) && isStringArray(sourceValue)) {
            target[key] = [... new Set<string>([...targetValue, ...sourceValue ])];
        } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            target[key] = targetValue.concat(sourceValue);
        } else if (isObject(targetValue) && isObject(sourceValue)) {
            target[key] = logAttrMerge(Object.assign({}, targetValue), sourceValue);
        } else {
            target[key] = sourceValue;
        }
    });

    return target;
}

export class AttrBuilder {

    attrs: ILogAttr = {}

    /**
     * attrs key "tags" 
     * @param tags string array
     * @returns 
     */
    addTag(...tags: string[]) {
        logAttrMerge(this.attrs, { tags })
        return this;
    }

    /**
     * attrs key "errors"
     * @deprecated
     * @param errors errors
     * @returns 
     */
    addError(...errors: any[]) {
        logAttrMerge(this.attrs, { errors })
        return this;
    }

    /**
     * attrs key "error"
     * @param error any error
     * @returns 
     */
    setError(error: any) {
        this.attrs['error'] = error;
        return this;
    }

    /**
     * attrs key "logKey"
     * @param key string
     */
    setLogKey(key: string) {
        this.attrs['logKey'] = key;
        return this;
    }

    /** @deprecated  alias of addAttr */
    pushAttr(attr: ILogAttr) {
        return this.addAttr(attr)
    }

    /** alias of addAttr */
    /** @deprecated  alias of addAttr */
    setAttr(attr: ILogAttr) {
        return this.addAttr(attr)
    }
    addAttr(attr: ILogAttr) {
        logAttrMerge(this.attrs, attr)
        return this;
    }

    /**
     * attrs key "track"
     * @param track string
     * @returns 
     */
    setTrack(track: string) {
        this.attrs['track'] = track;
        return this
    }
}

export class LogBuilder extends AttrBuilder {
    message?: string;

    setMessage(msg: string) {
        this.message = msg;
        return this;
    }
}





interface LogParamEx {
    (e: LogBuilder): void
}

interface AttrBuilderParam {
    (e: AttrBuilder): void
}




interface OLogger extends OLogFactory {

    parent?: Logger;
}




export class Logger {


    constructor(private logname: string, private canLog: ICanLog, private writer: ILogWriter, private opt: OLogger) {
        
    }

    fatal(msg: string, opt?: AttrBuilderParam) {
        return this.log(LogLevel.fatal, msg, opt);
    }
    fatalFn(fn: LogParamEx) {
        return this.logFn(LogLevel.fatal, fn);
    }
    error(msg: string, opt?: AttrBuilderParam) {
        return this.log(LogLevel.error, msg, opt);
    }
    errorFn(fn: LogParamEx) {
        return this.logFn(LogLevel.error, fn);
    }
    warn(msg: string, opt?: AttrBuilderParam) {
        return this.log(LogLevel.warn, msg, opt);
    }
    warnFn(fn: LogParamEx) {
        return this.logFn(LogLevel.warn, fn);
    }
    info(msg: string, opt?: AttrBuilderParam) {
        return this.log(LogLevel.info, msg, opt);
    }
    infoFn(fn: LogParamEx) {
        return this.logFn(LogLevel.info, fn);
    }
    debug(msg: string, opt?: AttrBuilderParam) {
        return this.log(LogLevel.debug, msg, opt);
    }
    debugFn(fn: LogParamEx) {
        return this.logFn(LogLevel.debug, fn);
    }
    trace(msg: string, opt?: AttrBuilderParam) {
        return this.log(LogLevel.trace, msg, opt);
    }
    traceFn(fn: LogParamEx) {
        return this.logFn(LogLevel.trace, fn);
    }


    async action<T>(actionName: string, message: string, handle: () => Promise<T>, opt?: {

        level?: {
            success?: LogLevel;
            fail?: LogLevel;
            request?: LogLevel;
        }
        tags?: string[],
        attr?: ILogAttr,
        track?: string
    }) {
        try {
            this.logFn(opt?.level?.request || LogLevel.debug, e => {
                e.message = message;
                if (opt?.attr) {
                    e.addAttr(opt?.attr)
                }

                if (opt?.tags) {
                    e.addTag(...opt.tags)
                }
                if (opt?.track) {
                    e.setTrack(opt.track)
                }
                e.addTag(`${actionName}.request`);
            })
            let r: T = await handle()

            this.logFn(opt?.level?.success || LogLevel.info, e => {
                e.message = message;
                if (opt?.attr) {
                    e.addAttr(opt?.attr)
                }
                if (opt?.tags) {
                    e.addTag(...opt.tags)
                }
                if (opt?.track) {
                    e.setTrack(opt.track)
                }
                e.setLogKey(`${actionName}.success`);
            })

            return r;
        } catch (error) {
            this.logFn(opt?.level?.fail || LogLevel.error, e => {
                e.message = message;
                if (opt?.attr) {
                    e.addAttr(opt?.attr)
                }

                if (opt?.tags) {
                    e.addTag(...opt.tags)
                }
                if (opt?.track) {
                    e.setTrack(opt.track)
                }
                e.setLogKey(`${actionName}.fail`);
                e.setError(error)
            })
            throw error;
        }
    }

    f(msg: string, opt?: AttrBuilderParam) {
        return this.fatal(msg, opt);
    }
    e(msg: string, opt?: AttrBuilderParam) {
        return this.error(msg, opt);
    }
    w(msg: string, opt?: AttrBuilderParam) {
        return this.warn(msg, opt);
    }
    i(msg: string, opt?: AttrBuilderParam) {
        return this.info(msg, opt);
    }
    d(msg: string, opt?: AttrBuilderParam) {
        return this.debug(msg, opt);
    }
    t(msg: string, opt?: AttrBuilderParam) {
        return this.trace(msg, opt);
    }

    log(level: LogLevel, message: string, opt?: AttrBuilderParam) {
        let can = this.canLog(level);
        if (can) {
            let p = new AttrBuilder()
            if (opt) {
                opt(p)
            }

            let attrs = logAttrMerge(this.attr || {}, p.attrs)

            this._log(level, message, attrs)
        }
    }

    logFn(level: LogLevel, fn: LogParamEx) {
        let can = this.canLog(level);
        if (can) {

            let p = new LogBuilder()

            fn(p);

            let msg = p.message || '';
            let attrs = logAttrMerge(this.attr || {}, p.attrs)

            this._log(level, msg, attrs)

        }
    }

    private _log(level: LogLevel, message: string, attrs: ILogAttr) {

        let log: ILogItem = {
            timestamp: Date.now(),
            logname: this.logname,
            level,
            message,
            attrs
        }

        this.writer(log);

    }




    child(logname: string, opt?: OLogFactory) {
        return new Logger(`${this.logname}.${logname}`, this.canLog, this.writer, {
            parent: this,
            attr: opt?.attr,
            tags: opt?.tags,
        })
    }


    // get tags(): string[] | undefined {
    //     if (this.opt.parent) {
    //         return [... (this.opt.parent.tags || []), ...(this.opt.tags || [])]
    //     }
    //     return this.opt.tags;
    // }
    get attr(): ILogAttr {
        let _att = logAttrMerge(this.opt.attr || {}, { tags: this.opt.tags })

        if (this.opt.parent) {
            logAttrMerge(_att, this.opt.parent.attr)
        }
        return _att
    }

}