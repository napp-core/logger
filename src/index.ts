import { ILogItem, ILogAttr, OLogFactory } from "./common";
import { LogLevel, LogColor } from "./level";

import { Logger, LogBuilder } from "./logger";
import { factoryLogManager, sampleLogWriter, parseLogLevel } from "./manager";

export const LogManager = factoryLogManager();

export {
    ILogItem, ILogAttr, OLogFactory,
    LogLevel, LogColor,
    Logger, LogBuilder,
    factoryLogManager, sampleLogWriter, parseLogLevel
}

export function getLogger(logname: string, opt?: OLogFactory) {
    return LogManager.factoryLogger(logname, {
        attr: opt?.attr,
        tags: opt?.tags,
    })
}

export default getLogger;