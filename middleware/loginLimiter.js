const rateLimit = require('express-rate-limit');
const { logEvents } = require('./logger');

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, //1 Minute
    max: 5, //Limit each IP to 5 logins requests per minute
    message: {
        message: 'Too many login attempts from this IP, please try again in 60 seconds'
    },
    handler: (req, res, next, options) => {
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true, //Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false  //Disable the `X-RateLimit-*` headers
})

module.exports = loginLimiter