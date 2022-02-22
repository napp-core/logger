import { suite, test, } from "@testdeck/mocha";
import { assert } from 'chai';
import { LogLevel } from "../src/level";
import { LevelStore } from "../src/store.level";

@suite
class TestLevelStore {

  store = new LevelStore()

  // before() {
  //   console.log('before ---------------------')
  //   this.store = new LevelStore()
  // }

  @test
  empty() {

    let store = new LevelStore();

    let s = store.canLog('a', LogLevel.info);
    assert.isFalse(s.has, 'empty store.has')
    assert.isFalse(s.can, 'empty store.can')

  }

  @test
  oneItem() {

    let store = new LevelStore();
    store.add({
      level: LogLevel.info,
      logname: 'l1',
      name: 'w1'
    })

    let s = store.canLog('nologname', LogLevel.info);

    assert.isFalse(s.has, 'nologname has')
    assert.isFalse(s.can, 'nologname can')

    let b = store.canLog('l1', LogLevel.info);

    assert.isTrue(b.has, 'oklogname has')
    assert.isTrue(b.can, 'oklogname can')

    let c = store.canLog('l1', LogLevel.debug);

    assert.isTrue(c.has, 'min loglevel has')
    assert.isFalse(c.can, 'min loglevel can')

    let w = store.canLog('l1', LogLevel.fatal);

    assert.isTrue(w.has, 'max loglevel has')
    assert.isTrue(w.can, 'max loglevel error')
  }

  @test
  twoItem() {

    let store = new LevelStore();
    store.add({
      level: LogLevel.info,
      logname: 'l1',
      name: 'w1'
    })
    store.add({
      level: LogLevel.debug,
      logname: 'l2',
      name: 'w2'
    })

    let s = store.canLog('nologname', LogLevel.info);

    assert.isFalse(s.has, 'nologname has')
    assert.isFalse(s.can, 'nologname can')

    {
      let a = store.canLog('l1', LogLevel.info);
      assert.isTrue(a.has, 'ok logname l1.has')
      assert.isTrue(a.can, 'ok logname l1.can')

      let b = store.canLog('l2', LogLevel.info);
      assert.isTrue(b.has, 'ok logname l2.has')
      assert.isTrue(b.can, 'ok logname l2.can')
    }

    {
      let a = store.canLog('l1', LogLevel.error);
      assert.isTrue(a.can, 'max level l1.can')
      let b = store.canLog('l1', LogLevel.debug);
      assert.isFalse(b.can, 'min level l1.can')
    }

    {
      let a = store.canLog('l2', LogLevel.info);
      assert.isTrue(a.can, 'max level l2.can')
      let b = store.canLog('l2', LogLevel.trace);
      assert.isFalse(b.can, 'min level l2.can')
    }

  }

  @test
  twoMachedItem() {

    let store = new LevelStore();
    store.add({
      level: LogLevel.error,
      logname: 'l1',
      name: 'w1'
    })


    {
      let n = store.canLog('nologname', LogLevel.info);
      assert.isFalse(n.has, 'nologname has')
      assert.isFalse(n.can, 'nologname can')
    }



    {
      let a = store.canLog('l1', LogLevel.info);
      assert.isTrue(a.has, 'ok logname l1.has')
      assert.isFalse(a.can, 'min leve l1.can')

      let b = store.canLog('l1', LogLevel.fatal);
      assert.isTrue(b.can, 'max leve l1.can')
    }

    let w2 = {
      level: LogLevel.debug,
      logname: 'l1',
      name: 'w2'
    };
    store.add(w2)

    {
      let a = store.canLog('l1', LogLevel.info);
      assert.isTrue(a.has, 'ok logname l1.has')
      assert.isTrue(a.can, 'effect w2. max level l1.can')
    }

    {
      let a = store.canLog('l1', LogLevel.trace);
      assert.isTrue(a.has, 'ok logname l1.has')
      assert.isFalse(a.can, 'effect w2. min leve l1.can')
    }


    // remove w2
    store.remove(w2)


    {
      let a = store.canLog('l1', LogLevel.info);
      assert.isTrue(a.has, 'ok logname l1.has')
      assert.isFalse(a.can, 'remove effect w2. max level l1.can')
    }

  }
}