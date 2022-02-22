import { LogLiner } from ".";
import { LogLevel } from "./level";


export interface ILogAttr {
    [k: string]: Object
}

export type ILogMessage = string | { (l: ILogItem): string };

export interface ILogItem {
    timestamp: number;
    level: LogLevel;
    logname: string;
    message?: () => string;
    attr?: ILogAttr;
    errors?: Error[];
    tags?: string[];
}


export interface OLogFactory {

    logLine?: LogLiner

    attr?: ILogAttr;
    tags?: string[];
}
