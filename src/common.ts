import { LogLevel } from "./level";

export type IAttrValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | { [x: string]: IAttrValue }
    | Array<IAttrValue>;

export type ILogAttr = Record<string, IAttrValue>;

export interface IError {
    name: string;
    message: string;
    data?: { [x: string]: IAttrValue };
    cause?: IError;
    stack?: string;
}

export interface ILogItem {
    timestamp: number;
    level: LogLevel;
    logname: string;
    message?: string;
    attrs?: ILogAttr;
}

export interface OLogFactory {
    attr?: ILogAttr;
    tags?: string[];
}
