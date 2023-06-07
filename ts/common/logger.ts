import log4js from "log4js";

log4js.configure({
    appenders: {
        nsl: {
            type: 'dateFile',
            filename: 'logs/nsl',
            pattern: "-yyyy-MM-dd.log",
            alwaysIncludePattern: true,
            category: 'normal'
        }
    },
    categories: { default: { appenders: ['nsl'], level: 'info' } }
})

export default log4js.getLogger();