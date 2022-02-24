import { LogLevel } from "./level";
import { ILogItem } from "./common";

export interface ILogWriter {
    (l: ILogItem): void
}

export interface ILogWriterItem {
    wname?: string;
    logname?: string
    level: LogLevel;
    writer: ILogWriter
}
export interface ILogTrackWriter {
    (l: ILogItem, wnames: { wname: string, level: LogLevel }[]): void
}



