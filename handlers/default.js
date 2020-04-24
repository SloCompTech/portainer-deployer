/**
 * Default deploy request handler
 */

const handle = async (req, res, data) => {
  res.send('Hello cow');
}

module.exports = {
  handle: handle,
}
