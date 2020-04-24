/**
 * Validation pipe
 * @see https://hapi.dev/module/joi/#usage
 */

const as = require('./async');

const validate = function (schema) {
  return as.wrap(async function (req, res, next) {
    const value = await schema.validateAsync(req.body);
    req.body = value;
    return next();
  });
}

module.exports = {
  validate: validate,
}
