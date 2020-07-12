class HttpError extends Error {
    constructor(message, errerCode) {
        super(message);
        this.code = errerCode;
    }
}

module.exports = HttpError;