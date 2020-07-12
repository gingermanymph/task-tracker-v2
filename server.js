const http = require('http');
const mongoose = require('mongoose');
const App = require('./app');

const config = require('config');

const PORT = process.env.PORT || config.get('port');
const HOST = '0.0.0.0';

const httpServer = http.createServer(App());

httpServer.on('listening', () => console.log('Server has been started . . .'));

// Conncting to the mongodb
mongoose
    .connect(config.get("mongoUri"), { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        // Listen server
        httpServer.listen(PORT, HOST);
    })
    .catch(err => {
        console.log(err);
    });