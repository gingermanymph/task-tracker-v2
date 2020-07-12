const HttpError = require('../helpers/http-error');

const unexistingRoutes = (req, res, next) => {
    const error = new HttpError('Could not find this page.', 404);
    return next(error);
}

const httpErrorsHandler = (error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }

    res.status(error.code || 500);
    res.json({
        data: { message: error.message || 'An unknown error occurred!' }
    });
}

module.exports = {
    unexistingRoutes,
    httpErrorsHandler
}