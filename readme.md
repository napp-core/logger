# common exception

javascript minimum resources usage logger library.


### key Features

- minimum resources
- saved preformice
- user friendly
- powerfull logger library
- support browser
- support nodejs




### Log level: 
fatal, error, warn, info, debug, trace


## basic use

``` typescript

const logger = getLogger('logname-1');
logger.debug(m => m.message('basic log message'))


...


try {
    //...
} catch (error) {
    logger.error(m=>m.message('error log message').exeption(error))
}


...


logger.error(m => {
    return m
        .message('error log message')
        .attr({ a: 'foo', b: 'baa' })
        .tag('tag1')
        .tag('tag2', 'tag3')
})


```


# log configration

``` typescript




```

