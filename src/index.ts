import { ILogItem, ILogAttr, OLogFactory, ILogMessage } from "./common";
import { LogLevel, LogColor } from "./level";
import { LogLiner } from "./line";
import { Logger } from "./logger";
import { factoryLogManager, sampleLogWriter, parseLogLevel } from "./manager";

export const LogManager = factoryLogManager();

export {
    ILogItem, ILogAttr, OLogFactory, ILogMessage,
    LogLevel, LogColor,
    LogLiner,
    Logger,
    factoryLogManager, sampleLogWriter, parseLogLevel
}

export function getLogger(logname: string, opt?: OLogFactory) {
    return LogManager.factoryLogger(logname, {
        attr: opt?.attr,
        tags: opt?.tags,
        logLine: opt?.logLine,
    })
}

export default getLogger;