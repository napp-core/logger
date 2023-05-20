import { LogLevel } from "./level";


export type ILogAttrValue = string | number | boolean | Date | null | undefined | ILogAttr | ILogAttrArray;
export interface ILogAttr { [x: string]: ILogAttrValue; }
export interface ILogAttrArray extends Array<ILogAttrValue> { }


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
