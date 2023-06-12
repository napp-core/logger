import { LogLevel } from "./level";
import { ILogItem } from "./common";

export interface ILogWriter {
    (l: ILogItem): void
}

export interface ILogWriterItem {
    wname?: string;
    logname?: string
    onRemoved?: () => void;
    level: LogLevel;
    writer: ILogWriter
}


