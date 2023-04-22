import { LogLevel } from "./level";


export interface ILogAttr {
    [k: string]: Object
}

// export type ILogMessage = string | { (l: ILogItem): string };



export interface ILogItem {
    timestamp: number;
    level: LogLevel;
    logname: string;
    message: () => string;

    attrs: () => ILogAttr | undefined
    tags: () => string[] | undefined;
    //attr?: ILogAttr;
    errors: () => Error[] | undefined;

}


export interface OLogFactory {

    attr?: ILogAttr;
    tags?: string[];
}
