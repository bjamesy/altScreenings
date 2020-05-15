module.exports = {
    errorHandler: fn => 
        (req, res, next) => {
            Promise.resolve(fn(req, res, next))
                    .catch(next);
        },
    seedHandler: fn => {
        (next) => {
            Promise.resolve(fn(next))
                    .catch(next);
        }
    }
};