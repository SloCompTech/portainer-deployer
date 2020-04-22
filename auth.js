/**
 * Authentication
 */
const jwt = require('jsonwebtoken');
const portainer = require('./portainer');

const init = async function (req, res, next) {
  // Skip, if authentication disabled
  if (process.env.DISABLE_AUTH) {
    return next();
  }

  try {
    const auth = req.headers['authorization']?.split(' ');
    if (!auth)
      throw new Error('Unauthorized'); // TODO
    
    const method = auth[0], val = auth[1];
    if (method == 'Bearer') { // Token
      req.token = val;
      req.user = jwt.decode(val);
      
    } else if (method == 'Basic') { // Username & password
      const raw = Buffer.from(val, 'base64').toString('utf8');
      const credentials = raw.split(':');
      const token = await portainer.login(credentials[0] || process.env.PORTAINER_USER, credentials[1] || process.env.PORTAINER_PASS);
      req.token = val;
      req.user = jwt.decode(token);
    }
  } catch (e) {
    console.log(e);
  }
  return next();
}

const isAuthenticated = function (req, res, next) {
  // Skip, if authentication disabled
  if (process.env.DISABLE_AUTH) {
    next();
    return;
  }

  // Check if authorized
  if (req.token) {
    return next();
  }

  res.status(404).send('Unauthorized');
}

module.exports = {
  init: init,
  isAuthenticated: isAuthenticated,
};
