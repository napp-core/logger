import getLogger, { LogLevel, LogManager, sampleLogWriter } from "../src";


LogManager.addWriter({
    level: LogLevel.trace,
    writer: sampleLogWriter()
})
LogManager.addWriter({
    logname : "teste",
    level: LogLevel.trace,
    writer: sampleLogWriter()
})

let log = getLogger("teste.adf");
let log1 = getLogger("other");



log.i("test out")
log1.i("test out")