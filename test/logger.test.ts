import { suite, test, } from "@testdeck/mocha";
import { assert } from 'chai';
import { ILogItem } from "../src/common";
import { LogLevel } from "../src/level";
import { factoryLogManager } from "../src/manager";


@suite
class TestLogger {


    before() {

    }

    @test
    basic() {

        const LogManager = factoryLogManager();
        const logger1 = LogManager.factoryLogger('log1');



        let buffer0: string[] = []
        let buffer1: string[] = []
        let buffer2: string[] = []

        let writer0 = (m: ILogItem) => {
            buffer0.push(m.message && m.message() || '')
        }
        let writer1 = (m: ILogItem) => {
            buffer1.push(m.message && m.message() || '')
        }
        let writer2 = (m: ILogItem) => {
            buffer2.push(m.message && m.message() || '')
        }

        LogManager.defaultWriter(writer0)
        LogManager.defaultLevel(LogLevel.info)
        LogManager.addWriter({
            name: 'w1', writer: writer1,
            level: LogLevel.debug, logname: 'log1'
        })
        LogManager.addWriter({
            name: 'w2', writer: writer2,
            level: LogLevel.error, logname: 'log2'
        })

        const logger2 = LogManager.factoryLogger('log2');
        const logger0 = LogManager.factoryLogger('log0');
        const logger3 = LogManager.factoryLogger('log3');

        


        logger0.t(m => m.message('t0'))
        logger0.d(m => m.message('d0'))
        logger0.i(m => m.message('i0'))
        logger0.w(m => m.message('w0'))
        logger0.e(m => m.message('e0'))
        logger0.f(m => m.message('f0'))

        logger1.t(m => m.message('t1'))
        logger1.d(m => m.message('d1'))
        logger1.i(m => m.message('i1'))
        logger1.w(m => m.message('w1'))
        logger1.e(m => m.message('e1'))
        logger1.f(m => m.message('f1'))

        logger2.t(m => m.message('t2'))
        logger2.d(m => m.message('d2'))
        logger2.i(m => m.message('i2'))
        logger2.w(m => m.message('w2'))
        logger2.e(m => m.message('e2'))
        logger2.f(m => m.message('f2'))

        logger3.t(m => m.message('t3'))
        logger3.d(m => m.message('d3'))
        logger3.i(m => m.message('i3'))
        logger3.w(m => m.message('w3'))
        logger3.e(m => m.message('e3'))
        logger3.f(m => m.message('f3'))



        assert.deepEqual(
            buffer0.sort(),
            [
                'i0', 'w0', 'e0', 'f0',
                'i3', 'w3', 'e3', 'f3',
            ].sort(),
            "default log writer"
        )

        assert.deepEqual(
            buffer1.sort(),
            [
                'd1', 'i1', 'w1', 'e1', 'f1',
            ].sort(),
            "log1 writer"
        )

        assert.deepEqual(
            buffer2.sort(),
            [
                'e2', 'f2',
            ].sort(),
            "log2 writer"
        )


        LogManager.removeWriter('w2')

        logger2.t(m => m.message('t2'))
        logger2.d(m => m.message('d2'))
        logger2.i(m => m.message('i2'))
        logger2.w(m => m.message('w2'))
        logger2.e(m => m.message('e2'))
        logger2.f(m => m.message('f2'))

        assert.deepEqual(
            buffer2.sort(),
            [
                'e2', 'f2',
            ].sort(),
            "w2 agin checkr"
        )

        assert.deepEqual(
            buffer0.sort(),
            [
                'i0', 'w0', 'e0', 'f0',
                'i2', 'w2', 'e2', 'f2',
                'i3', 'w3', 'e3', 'f3',

            ].sort(),
            "log0 agin check"
        )

    }


    @test
    multiWrite() {

        const LogManager = factoryLogManager();
        const logger0 = LogManager.factoryLogger('log0');
        const logger1 = LogManager.factoryLogger('log1');
        const logger2 = LogManager.factoryLogger('log2');


        let buffer0: string[] = []
        let buffer1: string[] = []
        let buffer2: string[] = []

        let writer0 = (m: ILogItem) => {
            buffer0.push(m.message && m.message() || '')
        }
        let writer1 = (m: ILogItem) => {
            buffer1.push(m.message && m.message() || '')
        }
        let writer2 = (m: ILogItem) => {
            buffer2.push(m.message && m.message() || '')
        }

        LogManager.defaultWriter(writer0)
        LogManager.defaultLevel(LogLevel.info)
        LogManager.addWriter({
            name: 'w1',
            logname: 'log1',
            level: LogLevel.debug,
            writer: writer1,
        })
        LogManager.addWriter({
            name: 'w2', writer: writer2,
            level: LogLevel.error, logname: 'log1'
        })

        logger0.t(m => m.message('t0'))
        logger0.d(m => m.message('d0'))
        logger0.i(m => m.message('i0'))
        logger0.w(m => m.message('w0'))
        logger0.e(m => m.message('e0'))
        logger0.f(m => m.message('f0'))

        logger1.t(m => m.message('t1'))
        logger1.d(m => m.message('d1'))
        logger1.i(m => m.message('i1'))
        logger1.w(m => m.message('w1'))
        logger1.e(m => m.message('e1'))
        logger1.f(m => m.message('f1'))

        logger2.t(m => m.message('t2'))
        logger2.d(m => m.message('d2'))
        logger2.i(m => m.message('i2'))
        logger2.w(m => m.message('w2'))
        logger2.e(m => m.message('e2'))
        logger2.f(m => m.message('f2'))


        assert.deepEqual(
            buffer0.sort(),
            [
                'i0', 'w0', 'e0', 'f0',
                'i2', 'w2', 'e2', 'f2',
            ].sort(),
            "default log writer"
        )

        assert.deepEqual(
            buffer1.sort(),
            [
                'd1', 'i1', 'w1', 'e1', 'f1',
            ].sort(),
            "log1. w1 writer"
        )

        assert.deepEqual(
            buffer2.sort(),
            [
                'e1', 'f1',
            ].sort(),
            "log1. w2 writer "
        )




    }


}