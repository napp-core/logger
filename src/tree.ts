

import { getLowLevel, isEqHighLevel, LogLevel } from "./level";



interface WItem {
    wname: string;
    level: LogLevel;

    logname: string
}
class LogNode {

    readonly childrens = new Map<string, LogNode>();
    readonly writers = new Map<string, WItem>();


    private _lowLevel?: LogLevel;

    public get lowLevel() { return this._lowLevel; }


    constructor(public readonly lname: string, private readonly parent?: LogNode) { }

    // get parent() { return this.opt.parent; }

    private shiftRoad(road: string[]): [string, string[]] {
        let first = road[0];
        let routes = [];
        let i = 1;
        let n = road.length;
        while (i < n) {
            routes.push(road[i++])
        }
        return [first, routes];
    }

    get(routes: string[]): LogNode | undefined {
        if (routes.length > 0) {
            let [k, _routes] = this.shiftRoad(routes);
            let child = this.childrens.get(k);
            if (child) {
                return child.get(_routes)
            }
            return undefined;
        } else {
            return this
        }
    }

    hasHighOrEqualLevel(routes: string[], level: LogLevel): boolean {

        if (this._lowLevel === undefined) {
            ;
        }
        else if (isEqHighLevel(level, this._lowLevel)) {
            return true;
        }



        if (routes.length > 0) {
            let [k, _routes] = this.shiftRoad(routes);
            let child = this.childrens.get(k);
            if (child) {
                return child.hasHighOrEqualLevel(_routes, level)
            }
        }

        return false
    }


    getWriters(routes: string[], level: LogLevel): WItem[] {
        let w: WItem[] = [];

        for (let [n, l] of this.writers) {
            if (isEqHighLevel(level, l.level)) {
                w.push(l)
            }
        }

        if (routes.length > 0) {
            let [k, _routes] = this.shiftRoad(routes);
            let child = this.childrens.get(k);
            if (child) {
                let cw = child.getWriters(_routes, level);
                w.push(...cw);
            }
        }


        return w
    }



    insert(routes: string[], witem: WItem) {
        if (routes.length > 0) {

            let [k, _routes] = this.shiftRoad(routes);

            let child = (() => {

                let child = this.childrens.get(k);
                if (child) {
                    return child
                }
                let _child = new LogNode(k, this);
                this.childrens.set(k, _child)
                return _child;
            })();

            child.insert(_routes, witem);
        } else {
            this.addWriter(witem)
        }
    }

    remove(routes: string[], witem: WItem) {
        if (routes.length > 0) {
            let [k, _routes] = this.shiftRoad(routes);
            let child = this.childrens.get(k);
            if (child) {
                child.remove(_routes, witem);
            }

        } else {
            this.removeWriter(witem)
        }
    }


    private addWriter(witem: WItem) {
        this.writers.set(witem.wname, witem);
        this.updateLowLevel();
    }
    private removeWriter(witem: WItem) {
        this.writers.delete(witem.wname);
        this.updateLowLevel();
    }

    private updateLowLevel() {
        let m: LogLevel | undefined = undefined;
        for (let [n, l] of this.writers) {
            m = getLowLevel(m, l.level)
        }
        this._lowLevel = m
    }

    toObject(): any {



        let lname = this.lname;
        let lowLevel = this._lowLevel === undefined ? '' : `${this._lowLevel}[${LogLevel[this._lowLevel]}]`;
        let writers = Array.from(this.writers.values()).map(it => `${it.wname}-${it.level}(${LogLevel[it.level]})`)
        let childrens = Array.from(this.childrens.values()).map(it => it.toObject())

        return { lname, lowLevel, writers, childrens }
    }
}

export class LogTree {

    readonly root = new LogNode('root');


    get(logname: string): LogNode | undefined {
        let routes = logname.split('.').filter(it => !!it);
        return this.root.get(routes)
    }
    needRunning(logname: string, level: LogLevel) {
        let routes = logname.split('.').filter(it => !!it);
        return this.root.hasHighOrEqualLevel(routes, level)
    }

    needWriters(logname: string, level: LogLevel) {
        let routes = logname.split('.').filter(it => !!it);
        return this.root.getWriters(routes, level)
    }
    addWriter(witem: WItem) {
        let routes = witem.logname.split('.').filter(it => !!it);
        this.root.insert(routes, witem)
    }

    removeWriter(witem: WItem) {
        let routes = witem.logname.split('.').filter(it => !!it);
        this.root.remove(routes, witem)
    }

    toObject() { return this.root.toObject() }
}