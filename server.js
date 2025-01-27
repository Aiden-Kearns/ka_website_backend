require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { logger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/db.js');
const mongoose = require('mongoose');
const { logEvents } = require('./middleware/logger.js');
const PORT = process.env.PORT || 3500;

connectDB();

//Forces use of logger before all other functions
app.use(logger);

//Allows API access to public or specific URL
app.use(cors(corsOptions));

//Middleware that allows the parsing of JSON information
app.use(express.json());

//Middleware that allows for the parsing of cookies
app.use(cookieParser());

//Middleware that allows access to static content (images or light css etc...)
app.use('/', express.static(path.join(__dirname, '/public')));

//Root Route
app.use('/', require('./routes/root'));

//Auth Route
app.use('/auth', require('./routes/authRoutes'));
//Users Route
app.use('/users', require('./routes/userRoutes.js'));

//Teams Route
app.use('/teams', require('./routes/teamRoutes.js'));

//Actives Route
app.use('/actives', require('./routes/activeRoutes.js'));

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, '/views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({message: '404 Resource Not Found'});
    } else {
        res.type('txt').send("404 Not Found");
    }
});

app.use(errorHandler);
mongoose.connection.once('open', () => {
    app.listen(PORT, process.env.HOST_URL || null, () => {
});

mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});
    
    console.log(`Server started at http://localhost:${PORT}`);
}); 