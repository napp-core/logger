import getLogger, { LogLevel, LogManager, LogTracker, sampleLogWriter } from "../src";


function logConfig() {
    LogManager.addWriter({
        level: LogLevel.info,
        writer: sampleLogWriter
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






// sample useage
module sampleUsage {
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
}


module logTrackSample {

    namespace db {
        const logger = getLogger('db');

        export function fun1(tracker: LogTracker) {
            const log = logger.child('fun1', { tracker });
            log.info(m => m('call fun1'))

            // ...
        }

        export function fun2(tracker: LogTracker) {
            const log = logger.child('fun2', { tracker });
            log.info(m => m('call fun2'))

            // ...
        }
    }

    namespace helper {
        const logger = getLogger('helper');

        export function fn1(tracker: LogTracker) {

            logger.info(m => m('call fn1').tag('fun1'))
            db.fun1(tracker);
            // ...
        }

        export function fn2(tracker: LogTracker) {
            const log = logger.child('fun2', { tracker });
            log.info(m => m('call fn2'))
            db.fun1(tracker);
            // ...
        }
    }


    namespace http {
        const logger = getLogger('http');

        export function route1(req: any) {


            const tracker = LogTracker.create(LogLevel.debug, 'debug')
            const log = logger.child('route1', { tracker })

            log.info(m => m('called route1'))
            helper.fn1(tracker);
            // ...
        }

    }
}