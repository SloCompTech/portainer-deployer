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
    const auth = (req.headers['authorization']) ? req.headers['authorization'].split(' ') : null;
    
    if (!auth) { // No authentication data in request
      if (process.env.PORTAINER_USER) { // Use credentials from environment variables
        const token = await portainer.login(process.env.PORTAINER_USER, process.env.PORTAINER_PASS);
        req.token = token;
        req.user = jwt.decode(token);
      }
    } else {
      const method = auth[0], val = auth[1];
      if (method == 'Bearer') { // Token
        req.token = val;
        req.user = jwt.decode(val);
      } else if (method == 'Basic') { // Username & password
        const raw = Buffer.from(val, 'base64').toString('utf8');
        const credentials = raw.split(':');
        const token = await portainer.login(credentials[0] || process.env.PORTAINER_USER, (credentials.length > 1 ? credentials[1] : null) || process.env.PORTAINER_PASS);
        req.token = token;
        req.user = jwt.decode(token);
      }
    }
  } catch (e) {
    console.log(e);
  }
  return next();
}

const isAuthenticated = function (req, res, next) {
  // Skip, if authentication disabled
  if (process.env.DISABLE_AUTH) {
    return next();
  }

  // Check if authorized
  if (req.token) {
    return next();
  }

  res.status(401).send('Unauthorized');
}

module.exports = {
  init: init,
  isAuthenticated: isAuthenticated,
};
