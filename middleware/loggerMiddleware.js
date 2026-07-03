
function loggerMiddleware(req, res, next) {

    const start = Date.now()

    res.on("finish", () => {
       
        const duration = Date.now() - start
        const timestamp = new Date().toISOString()
        let user = "Guest"

    if (req.user) {
    user = req.user.id
    }

    if (res.statusCode === 401) {
    user = "Unauthorized"
    }
        
 console.log(
    `[${timestamp}] ${req.method} ${req.originalUrl} | User: ${user} | ${res.statusCode} | ${duration}ms`
     )

     })

    next()

}

module.exports = loggerMiddleware