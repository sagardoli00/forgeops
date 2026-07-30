function loggerMiddleware(req, res, next) {

    const start = Date.now()

    res.on("finish", () => {

        const duration = Date.now() - start
        const timestamp = new Date().toISOString()

        const user =
            req.user?.id ||
            (res.statusCode === 401 ? "Unauthorized" : "Guest")

        let level = "INFO"

        if (res.statusCode >= 500) {
            level = "ERROR"
        } else if (res.statusCode >= 400) {
            level = "WARN"
        }

        console.log(
            `[${timestamp}] [${level}] ${req.method} ${req.originalUrl} | User: ${user} | Status: ${res.statusCode} | ${duration}ms`
        )
    })

    next()
}

module.exports = loggerMiddleware