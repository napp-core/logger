import { LogLevel } from "./level";
import { ILogItem } from "./common";

export interface ILogWriter {
    (l: ILogItem): void
}
export interface ILogTrackWriter {
    (l: ILogItem, wnames: { wname: string, level: LogLevel }[]): void
}



