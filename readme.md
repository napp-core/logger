# logger library

javascript minimum resources usage logger library.



### key Features

- minimum resources
- saved preformice
- log track
- user friendly
- powerfull logger library
- support browser
- support nodejs





### Log level: 
fatal, error, warn, info, debug, trace


## basic use

``` typescript

const logger = getLogger('userlog');
logger.info('basic log message')
logger.infoFn(e => {
    e.message = 'basic log message'
})

...


try {
    //...
} catch (error) {
    logger.error('error log message', e=>e.setError(error))
}


...


logger.errorFn(e => {
    e.message ='error log message'
    e.addAttr({ a: 'foo', b: 'baa' })
    e.addTag('tag1','tag2').addTag('tag3')
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
            log.info('log message')
            

            // ...

            return {
                id: '1', name: 'username'
            }
        }

        export function deleteUser() {
            log.debug('log message')

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

