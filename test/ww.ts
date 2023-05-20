import getLogger, { LogLevel, LogManager, sampleLogWriter } from "../src";


LogManager.addWriter({
    level: LogLevel.trace,
    writer: sampleLogWriter()
})

let log = getLogger("teste.adf");



log.i("test out")