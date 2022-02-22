import { LogLevel } from "./level";

interface IStoreItem {
    name: string;
    logname: string
    level: LogLevel;
}

class LeveLStoreItem {

    private value: LogLevel;

    private store = new Map<string, LogLevel>();

    constructor(wname: string, level: LogLevel) {
        this.store.set(wname, level);
        this.value = level;
    }

    add(wname: string, level: LogLevel) {
        this.store.set(wname, level);
        this.update()
    }

    remove(wname: string) {
        this.store.delete(wname);
        this.update()
    }

    private update() {
        let m = -1;
        for (let [n, l] of this.store) {
            m = Math.max(m, l)
        }
        this.value = m
    }



    get isEmpy() {
        return this.store.size < 1;
    }

    get current() {
        return this.value
    }

}
export class LevelStore {
    store: {
        [logname: string]: LeveLStoreItem
    } = {}

    add(witem: IStoreItem) {
        if (witem.logname in this.store) {
            this.store[witem.logname].add(witem.name, witem.level);
        } else {
            this.store[witem.logname] = new LeveLStoreItem(witem.name, witem.level)
        }
    }

    remove(witem: IStoreItem) {
        if (witem.logname in this.store) {
            let m = this.store[witem.logname];
            m.remove(witem.name);
            if (m.isEmpy) {
                delete this.store[witem.logname]
            }
        }
    }

    canLog(logname: string, level: LogLevel) {
        if (logname in this.store) {
            let can = level <= this.store[logname].current;
            return { can, has: true };
        }

        return { can: false, has: false };
    }
}