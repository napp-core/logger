import { suite, test, } from "@testdeck/mocha";
import { assert } from 'chai';
import { LogLevel } from "../src/level";
import { WriterStore } from "../src/store.writer";

@suite
class TestWriterStore {

  

  // before() {
  //   console.log('before ---------------------')
  //   this.store = new LevelStore()
  // }

  @test
  empty() {

    let store = new WriterStore();

    let s = store.getWNames('a');
    assert.isEmpty(s, 'empty wnames')

  }

  @test
  oneItem() {

    let store = new WriterStore();
    store.add({      
      logname: 'l1',
      name: 'w1'
    })

    {
      let n = store.getWNames('no');
      let l1 = store.getWNames('l1');

      assert.isEmpty(n, 'no logname')
      assert.deepEqual(l1, ["w1"], 'one log name')
  
    }

   
    
  }

  @test
  complex() {

    let store = new WriterStore();
    store.add({      
      logname: 'l1',
      name: 'w1'
    })
    let w2 = {      
      logname: 'l1',
      name: 'w2'
    }
    let w4 = {      
      logname: 'l1',
      name: 'w4'
    }
    store.add(w2)
    store.add(w4)

    store.add({      
      logname: 'l2',
      name: 'w3'
    })

    {
      let n = store.getWNames('no');
      let l1 = store.getWNames('l1');
      let l3 = store.getWNames('l2');

      assert.isEmpty(n, 'no logname')
      assert.deepEqual(l3, ["w3"].sort(), 'l3. one item')
      assert.deepEqual(l1.sort(), ["w1", "w2", "w4"].sort(), 'l1 ok')
  
    }

    store.remove(w2)

    {
      let l1 = store.getWNames('l1');
      assert.deepEqual(l1.sort(), ["w1", "w4"].sort(), 'remove w2 writer')
    }
    store.add({
      name :'w9',
      logname : 'l1'
    })

    {
      let l1 = store.getWNames('l1');
      assert.deepEqual(l1.sort(), ["w1", "w4", "w9"].sort(), 'remove w2 writer')
    }
   
    
  }

  
}