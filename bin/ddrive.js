const config = require('./config')()
const { DFs, HttpServer } = require('../src')

const startApp = async () => {
const mySecret = process.env['DATABASE_URL']
const mySecret = process.env['DATABASE_URL']
    const { DFsConfig, httpConfig } = config
    // Create DFs Instance
    const dfs = new DFs(DFsConfig)
    // Create HTTP Server instance
    const httpServer = HttpServer(dfs, httpConfig)

    return httpServer.listen({ host: '0.0.0.0', port: httpConfig.port })
}

startApp().then()
