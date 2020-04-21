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

// TODO: Validate env vars (proces.env)

const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;

// Async handler
const wrap = fn => (...args) => fn(...args).catch(args[2]);

/**
 * Global handlers
 * @see http://expressjs.com/en/resources/middleware/compression.html
 * @see https://www.npmjs.com/package/helmet
 * @see http://expressjs.com/en/resources/middleware/body-parser.html
 */
app.use(compression());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Deploy request handler
 */
app.post('/', wrap(async (req, res) => {

}));

app.listen(port, wrap(async () => {
  console.log(`Portainer deployer listening on http://localhost:${port}`);
}));
