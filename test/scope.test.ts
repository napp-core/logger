import { suite, test, skip } from "@testdeck/mocha";
import { assert } from 'chai';
import { Logger } from "../src";
import { ILogItem } from "../src/common";
import { LogLevel } from "../src/level";
import { LogLiner } from "../src/line";
import { factoryLogManager } from "../src/manager";


@suite
class TestLogLine {

    LogManager = factoryLogManager();

    bufferDefault: ILogItem[] = []
    bufferReq: ILogItem[] = []
    bufferJob: ILogItem[] = []
    bufferTest: ILogItem[] = []
    buffer1: ILogItem[] = []
    buffer2: ILogItem[] = []



    before() {
        this.LogManager = factoryLogManager();

        this.bufferDefault = []
        this.bufferReq = []
        this.bufferJob = []
        this.bufferTest = []
        this.buffer1 = []
        this.buffer2 = []

        let wDefault = (m: ILogItem) => {
            this.bufferDefault.push({ ...m })
        }

        let wReq = (m: ILogItem) => {
            this.bufferReq.push({ ...m })
        }
        let writer2 = (m: ILogItem) => {
            this.buffer2.push({ ...m })
        }

        this.LogManager.defaultWriter(wDefault)
        this.LogManager.addWriter({
            name: 'w1', writer: (m: ILogItem) => {
                this.buffer1.push({ ...m })
            },
            level: LogLevel.info, logname: 'log1'
        })

        this.LogManager.addWriter({
            name: 'w2', writer: writer2,
            level: LogLevel.info, logname: 'log2'
        });

        this.LogManager.addWriter({
            name: 'w-job', writer: (m: ILogItem) => {
                this.bufferJob.push({ ...m })
            },
            level: LogLevel.error, logname: 'log1'
        });

        this.LogManager.addWriter({
            name: 'w-req', writer: wReq,
            level: LogLevel.warn, logname: 'logreq'
        });

        this.LogManager.addWriter({
            name: 'w-test', writer: (m: ILogItem) => {
                this.bufferTest.push({ ...m })
            },
            level: LogLevel.warn, logname: 'nologname'
        });

    }

    dbFunction(logLine: LogLiner, msg: string) {
        let log = this.LogManager.factoryLogger('db', { logLine })
        log.i(m => m.message(msg))

    }

    HelperFunction(logLine: LogLiner, msg: string) {
        let log = this.LogManager.factoryLogger('helper', { logLine })
        log.i(m => m.message('h:' + msg))

        this.dbFunction(logLine, msg + '->db')
    }

    jobFunction(liner: LogLiner, msg: string) {

        let logLine = LogLiner.createWithParent(LogLevel.info, 'w-job', liner)

        let log = this.LogManager.factoryLogger('job', { logLine });
        log.i(l => l.message('j:' + msg))
        this.HelperFunction(logLine, msg + '->job')
    }

    reqFunction(liner: LogLiner, msg: string) {
        let logLine = LogLiner.createWithParent(LogLevel.debug, 'w-req', liner)
        let log = this.LogManager.factoryLogger('req', { logLine });
        log.i(l => l.message('r:' + msg))

        this.dbFunction(logLine, msg + '->db')
    }


    toMessage(m: ILogItem) {
        return m.message && m.message() || ''
    }
    print() {
        console.log('--------------- buffer1 ---------------')
        console.log(this.buffer1.map(it => `[${it.logname}] ` + this.toMessage(it)))

        console.log('--------------- buffer2 ---------------')
        console.log(this.buffer2.map(it => `[${it.logname}] ` + this.toMessage(it)))

        console.log('--------------- bufferDefault ---------------')
        console.log(this.bufferDefault.map(it => `[${it.logname}] ` + this.toMessage(it)))

        console.log('--------------- bufferJob ---------------')
        console.log(this.bufferJob.map(it => `[${it.logname}] ` + this.toMessage(it)))

        console.log('--------------- bufferReq ---------------')
        console.log(this.bufferReq.map(it => `[${it.logname}] ` + this.toMessage(it)))

        console.log('--------------- bufferTest ---------------')
        console.log(this.bufferTest.map(it => `[${it.logname}] ` + this.toMessage(it)))
    }

    @test
    normal() {

        const logger1 = this.LogManager.factoryLogger('log1');
        const logger2 = this.LogManager.factoryLogger('log2');


        logger1.d(m => m.message('debug'))
        logger1.i(m => m.message('info'))
        logger1.f(m => m.message('fatal'))

        assert.deepEqual(
            this.buffer1.map(it => this.toMessage(it)).sort(),
            [
                'info', 'fatal'
            ].sort(),
            "default log"
        )

        assert.deepEqual(
            this.bufferJob.map(it => this.toMessage(it)).sort(),
            [
                'fatal'
            ].sort(),
            "bufferJob fatal log"
        )

        // this.print()


    }

    @test
    basic() {

        let logLine = LogLiner.create(LogLevel.debug, 'w-test')
        const logger1 = this.LogManager.factoryLogger('log1', { logLine });
        const logger2 = this.LogManager.factoryLogger('log2',);

        logger1.i(m => m.message('log1'))


        logger1.debug(m => m.message('debug log'))

        assert.deepEqual(
            this.buffer1.map(it => this.toMessage(it)).sort(),
            [
                'log1'
            ].sort(),
            "default log writer"
        )

        assert.deepEqual(
            this.bufferTest.map(it => this.toMessage(it)).sort(),
            [
                'log1', 'debug log'
            ].sort(),
            "log line write"
        )




    }


    @test
    nextedLogLine() {

        const buffer1: ILogItem[] = []
        const buffer2: ILogItem[] = []

        this.LogManager.addWriter({
            name: 'wt-1', writer: (m: ILogItem) => {
                buffer1.push({ ...m })
            },
            level: LogLevel.error, logname: 'no1'
        })
        this.LogManager.addWriter({
            name: 'wt-2', writer: (m: ILogItem) => {
                buffer2.push({ ...m })
            },
            level: LogLevel.error, logname: 'no2'
        })

        let logLine1 = LogLiner.create(LogLevel.info, 'wt-1')
        let logLine2 = LogLiner.createWithParent(LogLevel.debug, 'wt-2', logLine1)


        const logger1 = this.LogManager.factoryLogger('log1', { logLine: logLine2 });

        logger1.t(m => m.message('t1'))
        logger1.d(m => m.message('d1'))
        logger1.i(m => m.message('i1'))
        logger1.w(m => m.message('w1'))
        logger1.e(m => m.message('e1'))
        logger1.f(m => m.message('f1'))




        assert.deepEqual(
            this.buffer1.map(it => this.toMessage(it)).sort(),
            [
                'i1', 'w1', 'e1', 'f1'
            ].sort(),
            "default log writer"
        )

        assert.deepEqual(
            [
                'i1', 'w1', 'e1', 'f1'
            ].sort(),
            buffer1.map(it => this.toMessage(it)).sort(),
            "logLine1 tester"
        )
        assert.deepEqual(

            [
                'd1', 'i1', 'w1', 'e1', 'f1'
            ].sort(),
            buffer2.map(it => this.toMessage(it)).sort(),
            "logLine2 tester"
        )




    }


    @test
    multiLogLine() {

        const buffer1: ILogItem[] = []
        const buffer2: ILogItem[] = []
        const buffer3: ILogItem[] = []

        this.LogManager.addWriter({
            name: 'wt-1', writer: (m: ILogItem) => {
                buffer1.push({ ...m })
            },
            level: LogLevel.error, logname: 'no1'
        })
        this.LogManager.addWriter({
            name: 'wt-2', writer: (m: ILogItem) => {
                buffer2.push({ ...m })
            },
            level: LogLevel.error, logname: 'no2'
        })
        this.LogManager.addWriter({
            name: 'wt-3', writer: (m: ILogItem) => {
                buffer3.push({ ...m })
            },
            level: LogLevel.error, logname: 'no2'
        })

        let logLine1 = LogLiner.create(LogLevel.info, 'wt-1')
        let logLine2 = LogLiner.create(LogLevel.info, 'wt-2')
        let logLine3 = LogLiner.createWithParent(LogLevel.debug, 'wt-3', logLine2)


        const logger1 = this.LogManager.factoryLogger('log1', { logLine: logLine2 });

        logger1.t(m => m.message('t1'))
        logger1.d(m => m.message('d1'))
        logger1.i(m => m.message('i1'))
        logger1.w(m => m.message('w1'))
        logger1.e(m => m.message('e1'))
        logger1.f(m => m.message('f1'))

        this.dbFunction(logLine1, '[aa:db]')

        this.HelperFunction(logLine1, '[bb:h]')
        this.jobFunction(logLine2, '[cc:job]')
        this.reqFunction(logLine3, '[dd:req]')

        assert.deepEqual(
            this.buffer1.map(it => this.toMessage(it)).sort(),
            [
                'i1', 'w1', 'e1', 'f1'
            ].sort(),
            "default log writer"
        )

        assert.deepEqual(
            [
                '[aa:db]',
                'h:[bb:h]',
                '[bb:h]->db'

            ].sort(),
            buffer1.map(it => this.toMessage(it)).sort(),
            "logLine1 tester"
        )
        assert.deepEqual(

            [
                'r:[dd:req]',
                '[dd:req]->db'
            ].sort(),
            buffer3.map(it => this.toMessage(it)).sort(),
            "logLine3 tester"
        )
        assert.deepEqual(

            [
                'i1', 'w1', 'e1', 'f1',
                'j:[cc:job]',
                'h:[cc:job]->job',
                '[cc:job]->job->db',
                'r:[dd:req]',
                '[dd:req]->db'
            ].sort(),
            buffer2.map(it => this.toMessage(it)).sort(),
            "logLine2 tester"
        )



        // this.print()

    }


}