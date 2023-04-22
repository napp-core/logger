import { LogLevel } from "./level";

import { Logger } from "./logger";

import { ILogItem, OLogFactory } from "./common";
import { ILogWriter, ILogWriterItem } from "./writer";
import { LogTree } from "./tree";



export function sampleLogWriter(): ILogWriter {
    return (l: ILogItem) => {

        console.log('')
        console.log('------------------------------------------------------------------------------------')
        console.log(`[${new Date(l.timestamp).toLocaleString()}] [${LogLevel[l.level]}] [${l.logname}]`, (l.tags() || []).map(it => '#' + it).join(', ') || '')
        console.log(l.message())
        console.log('');
        let attr = l.attrs();
        try {
            attr && console.log('attr:', JSON.stringify(attr));    
        } catch (error) {
            console.log('sampleLogWriter attr print error');
            console.log(error);
            console.log('attr:',attr);
        }

        let errs = l.errors() ;
        try {
            errs && errs.length && console.log(errs.map(e => console.error(e)))    
        } catch (error) {
            console.log('sampleLogWriter error print error');
            console.log(error);
            console.log('error:',errs);
        }
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


    const tree = new LogTree();

    const uuid = (() => {
        let id = Math.floor(Math.random() * 0xfffffff);
        let nx = () => id < 0xfffffff ? ++id : id = 1;
        return () => '' + Math.random().toString(36).substring(2) + nx().toString(36) + Date.now().toString(36);
    })();


    const write: ILogWriter = (l: ILogItem) => {
        let witems = tree.needWriters(l.logname, l.level);
        for (let n of witems) {
            let w = writers.get(n.wname);
            if (w) {
                w.writer(l)
            }
        }
    }
    
    const addWriter = (witem: ILogWriterItem) => {

        let wname = witem.wname || uuid();
        if (writers.has(wname)) {
            throw new Error('writer name daplicated')
        }

        writers.set(wname, witem);
        tree.addWriter({ level: witem.level, logname: witem.logname || '', wname })


        return () => {
            removeWriter(wname);
        }
    }

    const removeWriter = (wname: string) => {

        let witem = writers.get(wname);
        if (witem) {
            tree.removeWriter({ level: witem.level, logname: witem.logname || '', wname })
            writers.delete(wname);
        }
    }



    return {
        /**
         * 
         * @returns witem remove function
         */
        addWriter: (witem: ILogWriterItem) => addWriter(witem),
        
        removeWriter: (name: string) => removeWriter(name),
        factoryLogger: (logname: string, opt?: OLogFactory) => {
            return new Logger(logname,
                (l) => tree.needRunning(logname, l),
                (l) => write(l),                
                {
                    attr: opt?.attr,
                    tags: opt?.tags,
                })
        },
        logTreeObject : ()=>tree.toObject()
    }
}