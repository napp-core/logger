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
logger.info(m => m('basic log message'))
logger.info('basic log message')


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

import { LogLevel, LogManager, sampleLogWriter } from "../src";


function logConfig() {
    LogManager.addWriter({ // default log writer
        level : LogLevel.info, 
        writer : sampleLogWriter  
    });
    
    LogManager.addWriter({
        wname: 'dblog',
        level: LogLevel.error,
        logname: 'db',
        writer: {/* db log writer */ } as any
    })
    
    LogManager.addWriter({
        wname: 'httplog',
        level: LogLevel.info,
        logname: 'route1',
        writer: {/* route log writer */ } as any
    })
}


```




## sample usage

``` typescript

...

namespace db {
        const log = getLogger('db');
        export function createUser() {
            log.info(m => m('log message'))
            log.info('log message')
            

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


            let { id, name } = await log.action("#user.create", 'create new user. log message', async () => {
                return db.createUser()
            })
        }

        export async function route2(req: any) {

            const log = logger.child('route2')


            let { flag } = await log.action('#user.delete', 'delete user message. log message', async () => {
                return db.deleteUser()
            })

            // ...
        }

    }

```

