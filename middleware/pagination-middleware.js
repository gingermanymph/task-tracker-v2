const HttpError = require('../helpers/http-error');

const paginatedData = model => async (req, res, next) => {

    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    page = page > 0 ? page : 1;
    limit = limit <= 10 ? limit : 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination = {};

    if (startIndex > 0) {
        pagination.previous = {
            page: page - 1,
            limit
        };
    }

    if (endIndex < await model.countDocuments().exec()) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    try {
        pagination.result = await model.find().limit(limit).skip(startIndex).exec();
        res.paginatedResult = pagination;
        next();
    } catch (err) {
        const error = new HttpError(`${err.message}`, 500);
        return next(error);
    }
}

module.exports = paginatedData;