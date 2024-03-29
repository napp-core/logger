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
            buffer0.push(m.message || '')
        }
        let writer1 = (m: ILogItem) => {
            buffer1.push(m.message || '')
        }
        let writer2 = (m: ILogItem) => {
            buffer2.push(m.message || '')
        }

        LogManager.addWriter({
            wname: 'w0',
            writer: writer0,
            level: LogLevel.info
        })
        LogManager.addWriter({
            wname: 'w1', writer: writer1,
            level: LogLevel.debug, logname: 'log1'
        })
        LogManager.addWriter({
            wname: 'w2', writer: writer2,
            level: LogLevel.error, logname: 'log2'
        })

        

        const logger2 = LogManager.factoryLogger('log2');
        const logger0 = LogManager.factoryLogger('log0');
        const logger3 = LogManager.factoryLogger('log3');




        
        logger0.d(('d0'))
        logger0.i(('i0'))
        logger0.w(('w0'))
        logger0.e(('e0'))
        logger0.f(('f0'))

        
        logger1.d(('d1'))
        logger1.i(('i1'))
        logger1.w(('w1'))
        logger1.e(('e1'))
        logger1.f(('f1'))

        
        logger2.d(('d2'))
        logger2.i(('i2'))
        logger2.w(('w2'))
        logger2.e(('e2'))
        logger2.f(('f2'))

        
        logger3.d(('d3'))
        logger3.i(('i3'))
        logger3.w(('w3'))
        logger3.e(('e3'))
        logger3.f(('f3'))



        assert.deepEqual(
            [
                'i0', 'w0', 'e0', 'f0',
                'i1', 'w1', 'e1', 'f1',
                'i2', 'w2', 'e2', 'f2',
                'i3', 'w3', 'e3', 'f3',
            ].sort(),
            buffer0.sort(),
            "default log writer"
        )

        assert.deepEqual(
            [
                'd1', 'i1', 'w1', 'e1', 'f1',
            ].sort(),
            buffer1.sort(),
            "log1 writer"
        )

        assert.deepEqual(
            [
                'e2', 'f2',
            ].sort(),
            buffer2.sort(),
            "log2 writer"
        )


        LogManager.removeWriter('w2')

        
        logger2.d(('d2'))
        logger2.i(('i2'))
        logger2.w(('w2'))
        logger2.e(('e2'))
        logger2.f(('f2'))

        assert.deepEqual(           
            [
                'e2', 'f2',
            ].sort(),
            buffer2.sort(),
            "w2 agin checkr"
        )

        assert.deepEqual(
            [
                'i0', 'w0', 'e0', 'f0',
                'i1', 'w1', 'e1', 'f1',
                'i2', 'w2', 'e2', 'f2',
                'i2', 'w2', 'e2', 'f2',
                'i3', 'w3', 'e3', 'f3',

            ].sort(),
            buffer0.sort(),
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
            buffer0.push(m.message || '')
        }
        let writer1 = (m: ILogItem) => {
            buffer1.push(m.message || '')
        }
        let writer2 = (m: ILogItem) => {
            buffer2.push(m.message || '')
        }


        LogManager.addWriter({
            level: LogLevel.info,
            writer: writer0,
        })
        LogManager.addWriter({
            wname: 'w1',
            logname: 'log1',
            level: LogLevel.debug,
            writer: writer1,
        })
        LogManager.addWriter({
            wname: 'w2', writer: writer2,
            level: LogLevel.error, logname: 'log1'
        })

        // console.log(JSON.stringify(LogManager.logTreeObject(), undefined, 4))

        
        logger0.d(('d0'))
        logger0.i(('i0'))
        logger0.w(('w0'))
        logger0.e(('e0'))
        logger0.f(('f0'))

        
        logger1.d(('d1'))
        logger1.i(('i1'))
        logger1.w(('w1'))
        logger1.e(('e1'))
        logger1.f(('f1'))

        
        logger2.d(('d2'))
        logger2.i(('i2'))
        logger2.w(('w2'))
        logger2.e(('e2'))
        logger2.f(('f2'))


        assert.deepEqual(
            buffer0.sort(),
            [
                'i0', 'w0', 'e0', 'f0',
                'i1', 'w1', 'e1', 'f1',
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