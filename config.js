const fs = require('fs')
const path = require('path')
//require('dotenv').config({ path: '.env' })
const _ = require('lodash')

// Valid public access mode
const VALID_PUBLIC_ACCESS = ['READ_ONLY_FILE', 'READ_ONLY_PANEL']

// If webhook file exist load webhook urls from file
const loadWebhooks = () => {
    const filePath = path.join(process.cwd(), 'webhook.txt')
    const fileExist = fs.existsSync(filePath)
    if (!fileExist) return undefined
    const webhookFileBuffer = fs.readFileSync(filePath)

    return webhookFileBuffer.toString().split('\n')
}

const HttpConfig = () => {
    const {
        PORT = 3000,
        AUTH = 'barkeser2002:4343pla54',
        PUBLIC_ACCESS = 'READ_ONLY_FILE',
        DATABASE_URL = 'postgres://beqsihgk:UeHW-vN3Bcm3s227fkzEbrtwHNT6zN8F@kashin.db.elephantsql.com/beqsihgk',
    } = process.env

    // Check if database url exist.
    if (!DATABASE_URL) throw new Error('Database URL is missing')

    // Validate correct public access is supplied
    if (PUBLIC_ACCESS
        && !VALID_PUBLIC_ACCESS.includes(PUBLIC_ACCESS)) {
        throw new Error(`Invalid PUBLIC_ACCESS ${PUBLIC_ACCESS} supplied. Possible values are - ${VALID_PUBLIC_ACCESS.join(' ')}`)
    }
    // Prepare username password from auth
    const [user, pass] = AUTH.split(':')

    return {
        authOpts: {
            auth: { user, pass },
            publicAccess: PUBLIC_ACCESS,
        },
        port: PORT,
    }
}

const DFsConfig = () => {
    const {
        CHUNK_SIZE = '7864320',
        UPLOAD_CONCURRENCY = '3',
        REQUEST_TIMEOUT = '60000',
        SECRET = '',
        WEBHOOKS = 'https://discord.com/api/webhooks/1069690236482891950/uRZgdeZ9TWqXGfSl_T10usMGS8o9Ze6sEYMQF860z8jgZsq6sHXYI85av7oCFPGTO3sU,https://discord.com/api/webhooks/1069690389344301158/KmBT99lJAB1FBrTlU8abLVrTAuy2S0o3hzft2YPLbWFeHCZ8xWVapcOGztGwIG_if4oO,https://discord.com/api/webhooks/1069690465051480064/vhXivQnVGV3oxaNzDw6sg4DqmF8ygBh7D121ul41_jZQCjlFE3vBH_pYEwhxMZrurYY6,https://discord.com/api/webhooks/1069690519208333392/GlHILhvwEgMo_KM7kEH0VCZ19T4i6RG-EjefmfquMWtT85FEnPIGAP7royYxUmqwcRsz,https://discord.com/api/webhooks/1069690577924411543/1NOecUY9zdrkDNPe6QB5vLfh8RYHaiok0XNAr6MYjuYid1IZBPUjtonj8oigUHxxKRU0',
    } = process.env

    // Get webhook URLs
    let webhooks = loadWebhooks()
    if (!webhooks) webhooks = WEBHOOKS.split(',')
    if (!webhooks || !webhooks.length) {
        throw new Error('Webhook URLs missing. Webhook URLs seperated by "," in .env and seperated by "\n" webhook.txt file supported')
    }
    // If chunkSize is invalid set the default chunkSize
    let chunkSize = parseInt(CHUNK_SIZE, 10)
    if (!_.isFinite(chunkSize)
        || chunkSize < 1
        || chunkSize > 8388608) chunkSize = 7864320 // 7.5 MB

    // Set proper request timeout
    let timeout = parseInt(REQUEST_TIMEOUT, 10)
    if (!_.isFinite(timeout) || timeout < 1) timeout = 60000

    let maxConcurrency = parseInt(UPLOAD_CONCURRENCY, 10)
    if (!_.isFinite(maxConcurrency) || maxConcurrency < 1) maxConcurrency = 3

    return {
        chunkSize,
        webhooks,
        secret: SECRET,
        maxConcurrency,
        restOpts: {
            timeout,
        },
    }
}

module.exports = () => ({
    httpConfig: HttpConfig(),
    DFsConfig: DFsConfig(),
})
