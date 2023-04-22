import { suite, test, } from "@testdeck/mocha";
import { assert } from 'chai';
import { ILogItem } from "../src/common";
import { LogLevel } from "../src/level";
import { factoryLogManager } from "../src/manager";


@suite
class BasicTest {

    LogManager = factoryLogManager();
    buffer: ILogItem[] = []
    before() {
        this.LogManager = factoryLogManager();
        this.buffer = [];

        this.LogManager.addWriter({
            level: LogLevel.info,
            writer: (l) => {
                this.buffer.push(l)
            }
        })
    }

    @test
    hiLog() {

        let log = this.LogManager.factoryLogger('test');

        log.i(m => m('hi log'));

        assert.deepEqual(
            [
                'hi log'
            ].sort(),
            this.buffer.map(l => l.message()).sort(),
        )
    }

    @test
    hi1Log() {

        let log = this.LogManager.factoryLogger('test');

        log.i('hi1 log');

        assert.deepEqual(
            [
                'hi1 log'
            ].sort(),
            this.buffer.map(l => l.message()).sort(),
        )
    }



    @test
    logAttr() {

        let log = this.LogManager.factoryLogger('test');

        log.i((m) => m('log attr').attr({ a: 'aa', b: 'bbb' }));

        assert.deepEqual(
            [{ a: 'aa', b: 'bbb' }],
            this.buffer.map(l => l.attrs() || {}),
        )
    }

    @test
    logError() {

        let log = this.LogManager.factoryLogger('test');
        try {
            throw new Error('check error')
        } catch (error) {
            log.e((m) => m('error message').exeption(error as any));
        }



        assert.deepEqual(
            [['check error']],
            this.buffer.map(l => (l.errors() || []).map(e => e.message)),
        )
    }

    @test
    logTag() {

        let log = this.LogManager.factoryLogger('test');

        log.i((m) => m('log attr').tag('t1', 't2').tag('t3'));

        assert.deepEqual(
            [['t1', 't2', 't3']],
            this.buffer.map(l => l.tags() || []),
        )
    }


    @test
    logLoggerAttr() {
        let log = this.LogManager.factoryLogger('test', {
            attr: { a: 22, b: 33 }
        });

        log.i((m) => m('log attr').attr({ a: 44, e: 55 }));



        assert.deepEqual(
            [{ a: 44, b: 33, e: 55 }],
            this.buffer.map(l => {
                return l.attrs() || {}
            }),
        )
    }

    @test
    logLoggerTag() {
        let log = this.LogManager.factoryLogger('test', {
            tags: ['ltag']
        });

        log.i((m) => m('log attr').tag('mtag'));



        assert.deepEqual(
            [['ltag', 'mtag']],
            this.buffer.map(l => {
                return l.tags() || []
            }),
        )
    }

    @test
    logLoggerTagDaplicate() {
        let log = this.LogManager.factoryLogger('test', {
            tags: ['ltag', 'ta']
        });

        log.i((m) => m('log attr').tag('mtag', 'ta'));



        assert.deepEqual(
            [['ltag', 'mtag', 'ta'].sort()],
            this.buffer.map(l => {
                return (l.tags() || []).sort()
            }),
        )
    }

    @test
    logChild() {

        let logParent = this.LogManager.factoryLogger('a', {
            attr: { pattr: 'pattr', a: 11 },
            tags: ['ptag', 't2', 't3']
        });
        let log = logParent.child('b', {
            attr: { cattr: 'cattr', b: 22 },
            tags: ['ctag', 't2']
        });


        log.i((m) => m('child log')
            .attr({ a: 66, b: 77, c: 88 })
            .tag('t1', 't2').tag('t3'));

        assert.deepEqual(
            [['t1', 't2', 't3', 'ctag', 'ptag'].sort()],
            this.buffer.map(l => (l.tags() || []).sort()),
        )

        assert.deepEqual(
            [{ pattr: 'pattr', cattr: 'cattr', a: 66, b: 77, c: 88 }],
            this.buffer.map(l => (l.attrs() || {})),
        )
    }


}