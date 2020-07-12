
module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).send({});
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST', 'PATCH', 'DELETE');

    next();
}