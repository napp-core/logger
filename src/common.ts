import { LogLevel } from "./level";


export interface ILogAttr {
    [k: string]: Object
}


export interface ILogItem {
    timestamp: number;
    level: LogLevel;
    logname: string;


    message: () => string;

    tracing: () => string | undefined;
    attrs: () => ILogAttr | undefined
    tags: () => string[] | undefined;
    //attr?: ILogAttr;
    errors: () => Error[] | undefined;

}


export interface OLogFactory {

    attr?: ILogAttr;
    tags?: string[];
}
