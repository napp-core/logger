import { suite, test, } from "@testdeck/mocha";
import { assert } from 'chai';
import { LogLevel } from "../src/level";
import { LogTree } from "../src/tree";



@suite
class TestLognameTree {



    // before() {
    //   console.log('before ---------------------')
    //   this.store = new LevelStore()
    // }

    @test
    add1() {

        let tree = new LogTree()



        let w1 = {
            wname: 'w1',
            level: LogLevel.warn,
            logname: 'a.b.c',
        }

        let w2 = {
            wname: 'w2',
            level: LogLevel.debug,
            logname: 'a.b.c.e',
        }
        let w3 = {
            wname: 'w3',
            level: LogLevel.error,
            logname: 'a',
        }
        let w4 = {
            wname: 'w4',
            level: LogLevel.info,
            logname: 'a.b.c',
        }

        tree.addWriter(w1)
        tree.addWriter(w2)
        tree.addWriter(w3)
        tree.addWriter(w4)



        let pa = tree.get('a');


        assert.deepEqual(
            'a',
            pa?.lname,
            'lname'
        )
        assert.deepEqual(
            w3,
            pa?.writers.get(w3.wname),
            'w3 witer'
        )

        assert.deepEqual(
            LogLevel.info,
            tree.get('a.b.c')?.lowLevel,
            'a.b.c highLevel'
        )
        assert.deepEqual(
            undefined,
            tree.get('a.b.none')?.lowLevel,
            'a.b.none highLevel'
        )


    }
    @test
    root() {

        let tree = new LogTree()

        let w1 = {
            wname: 'w1',
            level: LogLevel.info,
            logname: '',
        }

        tree.addWriter(w1)
        tree.addWriter({
            wname: 'w2',
            level: LogLevel.debug,
            logname: 'a.b',
        })

        tree.addWriter({
            wname: 'w2',
            level: LogLevel.error,
            logname: 'a.c',
        })

        // console.log(JSON.stringify(tree.toObject(), null, 4))


        assert.deepEqual(
            false,
            tree.needRunning('', LogLevel.debug),
            'root. level.debug'
        )

        assert.deepEqual(
            true,
            tree.needRunning('dsd.sd', LogLevel.info),
            'root. level.info'
        )


        assert.deepEqual(
            [

            ].sort(),
            tree.needWriters('', LogLevel.debug).map(it => it.wname).sort(),
            'needWriters. level.debug'
        )


        assert.deepEqual(
            [
                'w1'
            ].sort(),
            tree.needWriters('', LogLevel.info).map(it => it.wname).sort(),
            'needWriters. level.info'
        )

        assert.deepEqual(
            [
                'w1', 'w2'
            ].sort(),
            tree.needWriters('a.b', LogLevel.info).map(it => it.wname).sort(),
            'needWriters->a.b level.info'
        )

        assert.deepEqual(
            [
                'w1'
            ].sort(),
            tree.needWriters('a.c', LogLevel.info).map(it => it.wname).sort(),
            'needWriters->a.c level.info'
        )
    }


    @test
    needRun() {
        let tree = new LogTree();



        let w1 = {
            wname: 'w1',
            level: LogLevel.warn,
            logname: 'a.b.c',
        }

        let w2 = {
            wname: 'w2',
            level: LogLevel.debug,
            logname: 'a.b.c.e',
        }
        let w3 = {
            wname: 'w3',
            level: LogLevel.error,
            logname: 'a',
        }
        let w4 = {
            wname: 'w4',
            level: LogLevel.info,
            logname: 'a.b.c',
        }

        let w5 = {
            wname: 'w5',
            level: LogLevel.debug,
            logname: 'a.b.p',
        }
        let w6 = {
            wname: 'w6',
            level: LogLevel.error,
            logname: 'a.b.p.u',
        }
        let w7 = {
            wname: 'w7',
            level: LogLevel.fatal,
            logname: 'a.b.p.r',
        }

        tree.addWriter(w1)
        tree.addWriter(w2)
        tree.addWriter(w3)
        tree.addWriter(w4)
        tree.addWriter(w5)
        tree.addWriter(w6)
        tree.addWriter(w7)

        assert.equal(
            false,
            tree.needRunning('none.b.c', LogLevel.info),
            'ok none'
        )

        assert.equal(
            false,
            tree.needRunning('a', LogLevel.info),
            'a level.info'
        )
        assert.equal(
            true,
            tree.needRunning('a', LogLevel.error),
            'a level.error'
        )

        assert.deepEqual(
            true,
            tree.needRunning('a', LogLevel.fatal),
            'a fatal level'
        )

        assert.deepEqual(
            false,
            tree.needRunning('a.b', LogLevel.info),
            'a.b level.info'
        )
        assert.deepEqual(
            true,
            tree.needRunning('a.b', LogLevel.error),
            'a.b level.error'
        )

        assert.equal(
            true,
            tree.needRunning('a.b.c', LogLevel.info),
            'ok equal'
        )
        assert.equal(
            true,
            tree.needRunning('a.b.c', LogLevel.warn),
            'ok hight'
        )
        assert.equal(
            false,
            tree.needRunning('a.b.c', LogLevel.debug),
            'ok low'
        )

        assert.equal(
            true,
            tree.needRunning('a.b.c.e', LogLevel.debug),
            'ok. next equal'
        )


        assert.equal(
            true,
            tree.needRunning('a.b.p.u', LogLevel.info),
            'ok. beforeLevel '
        )

        assert.equal(
            true,
            tree.needRunning('a.b.p.none', LogLevel.info),
            'ok. none '
        )


        // console.log(JSON.stringify(tree.toObject(), null, 4))
    }
    @test
    needWriter() {

        let tree = new LogTree();



        let w1 = {
            wname: 'w1',
            level: LogLevel.warn,
            logname: 'a.b.c',

        }

        let w2 = {
            wname: 'w2',
            level: LogLevel.debug,
            logname: 'a.b.c.e',

        }
        let w3 = {
            wname: 'w3',
            level: LogLevel.error,
            logname: 'a',

        }
        let w4 = {
            wname: 'w4',
            level: LogLevel.info,
            logname: 'a.b.c',

        }

        let w5 = {
            wname: 'w5',
            level: LogLevel.debug,
            logname: 'a.b.p',

        }
        let w6 = {
            wname: 'w6',
            level: LogLevel.error,
            logname: 'a.b.p.u',

        }
        let w7 = {
            wname: 'w7',
            level: LogLevel.fatal,
            logname: 'a.b.p.r',

        }

        tree.addWriter(w1)
        tree.addWriter(w2)
        tree.addWriter(w3)
        tree.addWriter(w4)
        tree.addWriter(w5)
        tree.addWriter(w6)
        tree.addWriter(w7)


        assert.deepEqual(
            [

            ].sort(),
            tree.needWriters('none.b.c', LogLevel.info).map(it => it.wname).sort(),
            'none'
        )



        assert.deepEqual(
            [

            ].sort(),
            tree.needWriters('a', LogLevel.info).map(it => it.wname).sort(),
            'a. needWriters info level'
        )



        assert.deepEqual(
            [
                'w3'
            ].sort(),
            tree.needWriters('a', LogLevel.fatal).map(it => it.wname).sort(),
            'a. fatal level'
        )


        

        assert.deepEqual(
            [

            ].sort(),
            tree.needWriters('a.b', LogLevel.debug).map(it => it.wname).sort(),
            'a.b level.debug'
        )

        assert.deepEqual(
            [
                'w3'
            ].sort(),
            tree.needWriters('a.b', LogLevel.error).map(it => it.wname).sort(),
            'a.b level.error'
        )

        assert.deepEqual(
            [
                'w3'
            ].sort(),
            tree.needWriters('a.b', LogLevel.fatal).map(it => it.wname).sort(),
            'a.b level.fatal'
        )


        assert.deepEqual(
            [

            ].sort(),
            tree.needWriters('a.b.c', LogLevel.debug).map(it => it.wname).sort(),
            'a.b.c level.debug'
        )

        assert.deepEqual(
            [
                'w4'
            ].sort(),
            tree.needWriters('a.b.c', LogLevel.info).map(it => it.wname).sort(),
            'a.b.c level.info'
        )

        assert.deepEqual(
            [
                'w4', 'w1'
            ].sort(),
            tree.needWriters('a.b.c', LogLevel.warn).map(it => it.wname).sort(),
            'a.b.c level.warn'
        )

        assert.deepEqual(
            [
                'w4', 'w1', 'w3'
            ].sort(),
            tree.needWriters('a.b.c', LogLevel.error).map(it => it.wname).sort(),
            'a.b.c level.error'
        )
        assert.deepEqual(
            [
                'w4', 'w1', 'w3'
            ].sort(),
            tree.needWriters('a.b.c', LogLevel.fatal).map(it => it.wname).sort(),
            'a.b.c level.fatal'
        )


        assert.deepEqual(
            [
                'w4', 'w1', 'w3'
            ].sort(),
            tree.needWriters('a.b.c.none', LogLevel.fatal).map(it => it.wname).sort(),
            'a.b.c.none level.fatal'
        )

        
        assert.deepEqual(
            [
                'w2'
            ].sort(),
            tree.needWriters('a.b.c.e', LogLevel.debug).map(it => it.wname).sort(),
            'a.b.c.e level.debug'
        )

        assert.deepEqual(
            [
                'w2', 'w4'
            ].sort(),
            tree.needWriters('a.b.c.e', LogLevel.info).map(it => it.wname).sort(),
            'a.b.c.e level.info'
        )
        assert.deepEqual(
            [
                'w2', 'w4'
            ].sort(),
            tree.needWriters('a.b.c.e.no.no1', LogLevel.info).map(it => it.wname).sort(),
            'a.b.c.e.no.no1 level.info'
        )


        assert.deepEqual(
            [
                'w5'
            ].sort(),
            tree.needWriters('a.b.p', LogLevel.info).map(it => it.wname).sort(),
            'a.b.p level.info'
        )

        assert.deepEqual(
            [
                'w5', 'w3'
            ].sort(),
            tree.needWriters('a.b.p', LogLevel.error).map(it => it.wname).sort(),
            'a.b.p level.error'
        )

        assert.deepEqual(
            [
                'w5', 'w3', 'w6'
            ].sort(),
            tree.needWriters('a.b.p.u', LogLevel.error).map(it => it.wname).sort(),
            'a.b.p.u level.error'
        )
        assert.deepEqual(
            [
                'w5',
            ].sort(),
            tree.needWriters('a.b.p.u', LogLevel.info).map(it => it.wname).sort(),
            'a.b.p.u level.info'
        )

        assert.deepEqual(
            [
                'w5',
            ].sort(),
            tree.needWriters('a.b.p.u.none.dd.dd', LogLevel.info).map(it => it.wname).sort(),
            'a.b.p.u.none.dd.dd level.info'
        )
        assert.deepEqual(
            [
                'w5', 'w3', 'w6'
            ].sort(),
            tree.needWriters('a.b.p.u.none.dd.dd', LogLevel.fatal).map(it => it.wname).sort(),
            'a.b.p.u.none.dd.dd level.fatal'
        )
        assert.deepEqual(
            [
                'w5'
            ].sort(),
            tree.needWriters('a.b.p.r', LogLevel.info).map(it => it.wname).sort(),
            'a.b.p.r level.info'
        )
        assert.deepEqual(
            [
                'w5', 'w7', 'w3'
            ].sort(),
            tree.needWriters('a.b.p.r', LogLevel.fatal).map(it => it.wname).sort(),
            'a.b.p.r fatal.fatal'
        )
    }



    @test
    removeBasic() {
        let tree = new LogTree();

        tree.addWriter({
            wname: 'w1', level: LogLevel.info,
            logname: 'a',
        })

        tree.addWriter({
            wname: 'w2', level: LogLevel.error,
            logname: 'a.b',
        })

        let w3 = {
            wname: 'w3', level: LogLevel.debug,
            logname: 'a.b.c',
        }

        tree.addWriter(w3)

        assert.deepEqual(
            [
                'w3'
            ].sort(),
            tree.needWriters('a.b.c', LogLevel.debug).map(it => it.wname).sort(),
            'a.b.c level.debug'
        )

        assert.deepEqual(
            [
                'w3', 'w1'
            ].sort(),
            tree.needWriters('a.b.c', LogLevel.info).map(it => it.wname).sort(),
            'a.b.c level.info'
        )

        assert.deepEqual(
            [
                'w3', 'w1', 'w2'
            ].sort(),
            tree.needWriters('a.b.c', LogLevel.error).map(it => it.wname).sort(),
            'a.b.c level.info'
        )

        tree.removeWriter(w3)

        assert.deepEqual(
            [

            ].sort(),
            tree.needWriters('a.b.c', LogLevel.debug).map(it => it.wname).sort(),
            'a.b.c level.debug'
        )

    }

}