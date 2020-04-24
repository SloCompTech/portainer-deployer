/**
 * ExpressJS async wrapper
 * @see https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
 */
const asyncWrap = (fn) => {
  return (...args) => {
    Promise.resolve(fn(...args)).catch(args[2]);
  };
}

module.exports = {
  wrap: asyncWrap,
}
