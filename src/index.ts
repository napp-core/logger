import { ILogItem, ILogAttr, OLogFactory, ILogMessage } from "./common";
import { LogLevel, LogColor } from "./level";
import { LogTracker } from "./track";
import { Logger } from "./logger";
import { factoryLogManager, sampleLogWriter, parseLogLevel } from "./manager";

export const LogManager = factoryLogManager();

export {
    ILogItem, ILogAttr, OLogFactory, ILogMessage,
    LogLevel, LogColor,
    LogTracker,
    Logger,
    factoryLogManager, sampleLogWriter, parseLogLevel
}

export function getLogger(logname: string, opt?: OLogFactory) {
    return LogManager.factoryLogger(logname, {
        attr: opt?.attr,
        tags: opt?.tags,
        tracker: opt?.tracker,
    })
}

export default getLogger;