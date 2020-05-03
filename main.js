const logger = require('./logger');

/**
 * Load configuration
 * default: .env (inside CWD)
 * you can use CONFIG variable to set custom path to config file
 * @see https://www.npmjs.com/package/dotenv
 */
logger.info('Loading configuration');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const configPath = process.env.CONFIG || path.join(process.cwd(), '.env');
if (fs.existsSync(configPath)) {
  const config = dotenv.config({
    encoding: 'utf8',
    path: configPath,
  });
  if (config.error)
    throw config.error;
}

// Config validation
logger.info('Validating configuration');
const Joi = require('@hapi/joi');
const configSchema = Joi.object().keys({
  DISABLE_AUTH: Joi.any(), // Disable authentication
  PORTAINER_API: Joi.string().pattern(/^https?:\/\/.*\/api$/).required(), // Portainer API URL
  PORTAINER_PASS: Joi.string(), // Portainer (default) user 
  PORTAINER_USER: Joi.string(), // Portainer (default) password
}).options({ allowUnknown: true });
const resval = configSchema.validate(process.env);
if (resval.error)
  throw resval.error;
process.env = resval.value;

/**
 * Handlers
 */
logger.info('Loading handlers');
const handlers = {};
const handlerpath = path.join(__dirname, 'handlers');
const files = fs.readdirSync(handlerpath);
for (const file of files) {
  const filepath = path.join(handlerpath, file);
  if (filepath.endsWith('.js')) {
    const handlerName = file.substring(0, file.length - 3);
    logger.info(`Loading handler ${handlerName}`);
    handlers[handlerName] = require(filepath);
  }
}

/**
 * Import packages
 * @see http://expressjs.com/en/resources/middleware/compression.html
 * @see https://www.npmjs.com/package/helmet
 * @see http://expressjs.com/en/resources/middleware/body-parser.html
 */
const auth = require('./auth');
const as = require('./async');
const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const requestIp = require('request-ip');
const util = require('util');
const validate = require('./validate');

const app = express();
const port = process.env.PORT || 3000;

// Global handlers
app.use(compression());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(as.wrap(auth.init));

/**
 * Deploy request handler
 */
const deployRequestSchema = Joi.object().keys({
  handler: Joi.string().default('default'),
  data: Joi.any(),
});
app.post('/', auth.isAuthenticated, validate.validate(deployRequestSchema), as.wrap(async (req, res) => {
  logger.info(`Deploy request from ${requestIp.getClientIp(req)}`);
  
  const handlerName = req.body.handler;
  if (handlers[handlerName] && handlers[handlerName].handle) { // Check if handler exists
    if (util.types.isAsyncFunction(handlers[handlerName].handle) || util.types.isPromise(handlers[handlerName].handle)) { // Check if promise/async
      await handlers[handlerName].handle(req, res, req.body.data);
    } else {
      handlers[handlerName].handle(req, res, req.body.data);
    }
  }
}));

/**
 * Not found handler
 */
app.use((req, res, next) => {
  return res.status(404).send({ error: { message: 'Not found' }});
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  return res.status(err.status || 500).send({ error: err });
});

app.listen(port, as.wrap(async () => {
  logger.info(`Portainer deployer listening on ${port}`);
}));
