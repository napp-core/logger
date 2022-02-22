import { LogLevel } from "./level";
import { LevelStore } from "./store.level";
import { Logger } from "./logger";
import { WriterStore } from "./store.writer";
import { ILogItem, OLogFactory } from "./common";
import { ILogLinerWriter, ILogWriter } from "./writer";

export interface ILogWriterItem {
    name: string;
    logname: string
    level: LogLevel;
    writer: ILogWriter
}

export function sampleLogWriter(): ILogWriter {
    return (l: ILogItem) => {

        console.log('')
        console.log('------------------------------------------------------------------------------------')
        console.log(`[${new Date(l.timestamp).toLocaleString()}] [${LogLevel[l.level]}] [${l.logname}]`, l.tags && l.tags.map(it => '#' + it).join(', ') || '')
        l.message && console.log(l.message())
        console.log('')
        l.attr && console.log(JSON.stringify(l.attr))
        l.errors && l.errors.map(e => console.error(e))
    }
}

export function parseLogLevel(level: string) {

    let l = (level || '').toLowerCase();
    if (l) {
        if (['i', 'info', 'notice'].indexOf(l) > -1) {
            return LogLevel.info;
        }

        if (['w', 'warn', 'warning', 'alert'].indexOf(l) > -1) {
            return LogLevel.warn;
        }
        if (['d', 'debug', 'trace'].indexOf(l) > -1) {
            return LogLevel.debug;
        }
        if (['e', 'error', 'critical', 'fatal'].indexOf(l) > -1) {
            return LogLevel.error;
        }

        console.warn('cannot parse LoggerLevel from ', level)
    }
    return LogLevel.info;
}

export function factoryLogManager() {
    const writers = new Map<string, ILogWriterItem>();
    const levelStore = new LevelStore();
    const writeStore = new WriterStore();



    const d = {
        writer: sampleLogWriter(),
        level: LogLevel.trace
    }

    const canLog = (logname: string, level: LogLevel) => {
        {
            let { can, has } = levelStore.canLog(logname, level);

            if (has) {
                return can;
            }
        }

        return level <= d.level;
    }

    const write: ILogWriter = (l: ILogItem) => {
        let wnames = writeStore.getWNames(l.logname);
        if (wnames.length > 0) {
            for (let n of wnames) {
                let w = writers.get(n);
                if (w && l.level <= w.level) {
                    w.writer(l)
                }
            }
        } else {
            d.writer(l)
        }
    }
    const linerWrite: ILogLinerWriter = (l, wnames) => {
        for (let n of wnames) {
            let w = writers.get(n.wname);
            if (w && l.level <= n.level) {
                w.writer(l)
            }
        }
    }

    const addWriter = (witem: ILogWriterItem) => {

        writeStore.add(witem)
        levelStore.add(witem)
        writers.set(witem.name, witem);

        return () => {
            removeWriter(witem.name);
        }
    }

    const removeWriter = (name: string) => {

        let witem = writers.get(name);
        if (witem) {
            levelStore.remove(witem)
            writeStore.remove(witem)
            writers.delete(name);
        }
    }



    return {
        defaultWriter: (writer: ILogWriter) => { d.writer = writer; },
        defaultLevel: (level: LogLevel) => { d.level = level; },
        addWriter: (witem: ILogWriterItem) => addWriter(witem),
        removeWriter: (name: string) => removeWriter(name),
        factoryLogger: (logname: string, opt?: OLogFactory) => {
            return new Logger(logname,
                (l) => canLog(logname, l),
                (l) => write(l),
                (l, names) => linerWrite(l, names),
                {
                    attr: opt?.attr,
                    tags: opt?.tags,
                    logLine: opt?.logLine
                })
        }
    }
}