import { LogLevel } from "./level";
import { ILogItem } from "./common";

export interface ILogWriter {
    (l: ILogItem): void;

    onRemoved?: () => void;
}

export interface ILogWriterItem {
    wname?: string;
    logname?: string
    level: LogLevel;
    writer: ILogWriter
}


