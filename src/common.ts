import { LogLevel } from "./level";
export interface ILogAttr { [x: string]: any; }
export interface ILogItem {
    timestamp: number;
    level: LogLevel;
    logname: string;


    message?: string;

    track?: string;

    tags?: string[];
    attrs?: ILogAttr;
    errors?: any[];
}

export interface OLogFactory {
    attr?: ILogAttr;
    tags?: string[];
}
