import { LogLevel } from "./level";

export class LogTracker {

    private values: {
        lowLevel: LogLevel,
        wnames: { wname: string, level: LogLevel }[]
    }

    private constructor(private level: LogLevel, private wname: string, private parent: LogTracker | null) {
        let lowLevel = (() => {
            if (parent) {
                return Math.max(this.level, parent.lowLevel);
            }
            return this.level;

        })();

        let wnames = (() => {
            if (parent) {
                let wnames: { wname: string, level: LogLevel }[] = [];
                let me = false;
                for (let it of parent.wnames) {
                    if (it.wname === wname) {
                        me = true;
                        wnames.push({ wname, level: Math.max(it.level, level) });
                    } else {
                        wnames.push({ ...it })
                    }
                }

                if (me === false) {
                    wnames.push({ wname, level });
                }

                return wnames
            }
            return [{ wname, level }];
        })();

        this.values = { lowLevel, wnames }
    }


    chain(level: LogLevel, wname: string) {
        return new LogTracker(level, wname, this);
    }

    static create(level: LogLevel, wname: string) {
        return new LogTracker(level, wname, null);
    }
    static createChain(level: LogLevel, wname: string, logLone: LogTracker) {
        return new LogTracker(level, wname, logLone);
    }


    get lowLevel(): LogLevel {
        return this.values.lowLevel;
    }

    get wnames() {
        return this.values.wnames;
    }
}