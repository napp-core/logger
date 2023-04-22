export enum LogLevel {
    fatal = 0,
    error = 10,
    warn = 20,
    info = 30,
    debug = 40
}



export function isHighLevel(_is: LogLevel, _v: LogLevel) {
    return _is < _v ? true : false;
}

export function isEqHighLevel(_is: LogLevel, _v: LogLevel) {
    return _is <= _v ? true : false;
}

export function isLowLevel(_is: LogLevel, _v: LogLevel) {
    return _is > _v ? true : false;
}
export function getHighLevel(a: LogLevel | undefined, b: LogLevel) {
    if (a === undefined) {
        return b;
    }
    return a < b ? a : b;
}

export function getLowLevel(a: LogLevel | undefined, b: LogLevel) {
    if (a === undefined) {
        return b;
    }
    return a > b ? a : b;
}

export const LogColor = {
    [LogLevel.fatal]: 'red',
    [LogLevel.error]: 'red',
    [LogLevel.warn]: 'yellow',
    [LogLevel.info]: 'green',
    [LogLevel.debug]: 'cyan'
};