import { suite, test, skip } from "@testdeck/mocha";
import { assert } from 'chai';
import { Logger } from "../src";
import { ILogItem } from "../src/common";
import { LogLevel } from "../src/level";
import { LogTracker } from "../src/track";
import { factoryLogManager } from "../src/manager";


@suite
class TestTracker {

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

        this.LogManager.addWriter({
            level : LogLevel.info,
            writer : wDefault
        })
        this.LogManager.addWriter({
            wname: 'w1', writer: (m: ILogItem) => {
                this.buffer1.push({ ...m })
            },
            level: LogLevel.info, logname: 'log1'
        })

        this.LogManager.addWriter({
            wname: 'w2', writer: writer2,
            level: LogLevel.info, logname: 'log2'
        });

        this.LogManager.addWriter({
            wname: 'w-job', writer: (m: ILogItem) => {
                this.bufferJob.push({ ...m })
            },
            level: LogLevel.error, logname: 'log1'
        });

        this.LogManager.addWriter({
            wname: 'w-req', writer: wReq,
            level: LogLevel.warn, logname: 'logreq'
        });

        this.LogManager.addWriter({
            wname: 'w-test', writer: (m: ILogItem) => {
                this.bufferTest.push({ ...m })
            },
            level: LogLevel.warn, logname: 'nologname'
        });

    }

    dbFunction(logLine: LogTracker, msg: string) {
        let log = this.LogManager.factoryLogger('db', { tracker: logLine })
        log.i(m => m(msg))
    }

    HelperFunction(logLine: LogTracker, msg: string) {
        let log = this.LogManager.factoryLogger('helper', { tracker: logLine })
        log.i(m => m('h:' + msg))

        this.dbFunction(logLine, msg + '->db')
    }

    jobFunction(liner: LogTracker, msg: string) {

        let logLine = LogTracker.createChain(LogLevel.info, 'w-job', liner)

        let log = this.LogManager.factoryLogger('job', { tracker: logLine });
        log.i(l => l('j:' + msg))
        this.HelperFunction(logLine, msg + '->job')
    }

    reqFunction(liner: LogTracker, msg: string) {
        let logLine = LogTracker.createChain(LogLevel.debug, 'w-req', liner)
        let log = this.LogManager.factoryLogger('req', { tracker: logLine });
        log.i(l => l('r:' + msg))

        this.dbFunction(logLine, msg + '->db')
    }


    toMessage(m: ILogItem) {
        return m.message() || ''
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


        logger1.d(m => m('debug'))
        logger1.i(m => m('info'))
        logger1.f(m => m('fatal'))

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

        let logLine = LogTracker.create(LogLevel.debug, 'w-test')
        const logger1 = this.LogManager.factoryLogger('log1', { tracker: logLine });
        const logger2 = this.LogManager.factoryLogger('log2',);

        logger1.i(m => m('log1'))


        logger1.debug(m => m('debug log'))

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
            wname: 'wt-1', writer: (m: ILogItem) => {
                buffer1.push({ ...m })
            },
            level: LogLevel.error, logname: 'no1'
        })
        this.LogManager.addWriter({
            wname: 'wt-2', writer: (m: ILogItem) => {
                buffer2.push({ ...m })
            },
            level: LogLevel.error, logname: 'no2'
        })

        let logLine1 = LogTracker.create(LogLevel.info, 'wt-1')
        let logLine2 = LogTracker.createChain(LogLevel.debug, 'wt-2', logLine1)


        const logger1 = this.LogManager.factoryLogger('log1', { tracker: logLine2 });

        logger1.t(m => m('t1'))
        logger1.d(m => m('d1'))
        logger1.i(m => m('i1'))
        logger1.w(m => m('w1'))
        logger1.e(m => m('e1'))
        logger1.f(m => m('f1'))




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
            wname: 'wt-1', writer: (m: ILogItem) => {
                buffer1.push({ ...m })
            },
            level: LogLevel.error, logname: 'no1'
        })
        this.LogManager.addWriter({
            wname: 'wt-2', writer: (m: ILogItem) => {
                buffer2.push({ ...m })
            },
            level: LogLevel.error, logname: 'no2'
        })
        this.LogManager.addWriter({
            wname: 'wt-3', writer: (m: ILogItem) => {
                buffer3.push({ ...m })
            },
            level: LogLevel.error, logname: 'no2'
        })

        let logLine1 = LogTracker.create(LogLevel.info, 'wt-1')
        let logLine2 = LogTracker.create(LogLevel.info, 'wt-2')
        let logLine3 = LogTracker.createChain(LogLevel.debug, 'wt-3', logLine2)


        const logger1 = this.LogManager.factoryLogger('log1', { tracker: logLine2 });

        logger1.t(m => m('t1'))
        logger1.d(m => m('d1'))
        logger1.i(m => m('i1'))
        logger1.w(m => m('w1'))
        logger1.e(m => m('e1'))
        logger1.f(m => m('f1'))

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