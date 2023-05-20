import getLogger, { LogLevel, LogManager, sampleLogWriter } from "../src";


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
            log.debug(('log message'))

            // ...

            return {
                id: '1', name: 'username'
            }
        }

        export function deleteUser() {
            log.debug(('log message'))

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


