# logger library

javascript minimum resources usage logger library.



### key Features

- minimum resources
- saved preformice
- log tracking
- user friendly
- powerfull logger library
- support browser
- support nodejs





### Log level: 
fatal, error, warn, info, debug, trace


## basic use

``` typescript

const logger = getLogger('userlog');
logger.debug(m => m('basic log message'))


...


try {
    //...
} catch (error) {
    logger.error(m=>m('error log message').exeption(error))
}


...


logger.error(m => {
    return m('error log message')
        .attr({ a: 'foo', b: 'baa' })
        .tag('tag1')
        .tag('tag2', 'tag3')
})


```



# log configration

``` typescript

import { getLogger, LogLevel, LogManager, sampleLogWriter } from "../src";


LogManager.defaultLevel(LogLevel.info);
LogManager.defaultWriter(sampleLogWriter);

LogManager.addWriter({
    name: 'dblog',
    level: LogLevel.error,
    logname: 'db',
    writer: {/* db log writer */ } as any
})

LogManager.addWriter({
    name: 'httplog',
    level: LogLevel.info,
    logname: 'route1',
    writer: {/* route log writer */ } as any
})


```




## sample usage

``` typescript

...

namespace db {
    const log = getLogger('db');
    export function createUser() {
        log.debug(m => m('log message'))
        
        // ...

        return {
            id: '1', name: 'username'
        }
    }

    export function deleteUser() {
        log.debug(m => m('log message'))

        // ...

        return {
            flag: true
        }
    }

}


namespace http {
    const logger = getLogger('http');

    export async function route1(req: any) {
        const log = logger.child('route1')
        // ...


        let { id, name } = await log.action('user.create', 'create new user. log message', async () => {
            return db.createUser()
        })
    }

    export async function route2(req: any) {

        const log = logger.child('route2')


        let { flag } = await log.action('user.del', 'delete user message. log message', async () => {
            return db.deleteUser()
        })

        // ...
    }

}

```


# log track

``` typescript
namespace db {
    const logger = getLogger('db');

    export function fun1(tracker: LogTracker) {
         const log = logger.child('fun1', { tracker});
         log.info(m=>m('call fun1'))

        // ...
    }

    export function fun2(tracker: LogTracker) {
        const log = logger.child('fun2', { tracker});
        log.info(m=>m('call fun2'))

       // ...
   }
}

namespace helper {
    const logger = getLogger('helper');

    export function fn1(tracker: LogTracker) {      

         logger.info(m=>m('call fn1').tag('fun1'))
         db.fun1(tracker);
        // ...
    }

    export function fn2(tracker: LogTracker) {
        const log = logger.child('fun2', { tracker});
        log.info(m=>m('call fn2'))
        db.fun1(tracker);
       // ...
   }
}


namespace http {
    const logger = getLogger('http');

    export function route1(req:any) {      
        
        
        const tracker= LogTracker.create(LogLevel.debug, 'debug')
        const log= logger.child('route1', { tracker})

        log.info(m=>m('called route1'))
        helper.fn1(tracker);
        // ...
    }
    
}

```

