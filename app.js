const express = require('express');
const bodyParser = require('body-parser');

const cors = require('./middleware/cors');
const { unexistingRoutes, httpErrorsHandler }= require('./routes/http-errors-routes');

const usersRoures = require('./routes/users-routes');
const tasksRoures = require('./routes/tasks-routes');

module.exports = () => {
    const app = express();

    app.disable('x-powered-by');

    // middle wares
    app.use(cors);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // routes
    app.use('/api/users', usersRoures);
    app.use('/api/tasks', tasksRoures);
    // The 404 error handler for unexisting routes
    app.use(unexistingRoutes);
    // The http errors handler
    app.use(httpErrorsHandler);

    return app;
}