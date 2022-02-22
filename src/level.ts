export enum LogLevel {
    fatal = 0,
    error = 1,
    warn = 2,
    info = 3,
    debug = 4,
    trace = 5
}

export const LogColor = {
    [LogLevel.fatal]: 'red',
    [LogLevel.error]: 'red',
    [LogLevel.warn]: 'yellow',
    [LogLevel.info]: 'green',
    [LogLevel.debug]: 'cyan',
    [LogLevel.trace]: 'magenta'
};