/**
 * Load configuration
 * default: .env (inside CWD)
 * you can use CONFIG variable to set custom path to config file
 * @see https://www.npmjs.com/package/dotenv
 */
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const configPath = process.env.CONFIG || path.join(process.cwd(), '.env');
if (fs.existsSync(configPath)) {
  const config = dotenv.config({
    encoding: 'utf8',
    path: process.env.CONFIG,
  });
  if (config.error)
    throw config.error;
}

// Config validation
const Joi = require('@hapi/joi');
const configSchema = Joi.object().keys({
  DISABLE_AUTH: Joi.any(), // Disable authentication
  PORTAINER_API: Joi.string().required(), // Portainer API URL
  PORTAINER_DIR: Joi.string().required(), // Portainer directory
  PORTAINER_PASS: Joi.string(), // Portainer (default) user 
  PORTAINER_USER: Joi.string(), // Portainer (default) password
}).options({ allowUnknown: true });
const resval = configSchema.validate(process.env);
if (resval.error)
  throw resval.error;
process.env = resval.value;

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
const validate = require('./validate');

const app = express();
const port = process.env.PORT || 3000;

// Async handler
const wrap = fn => (...args) => fn(...args).catch(args[2]);

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
}));

app.listen(port, as.wrap(async () => {
  console.log(`Portainer deployer listening on http://localhost:${port}`);
}));
