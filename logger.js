/**
 * Winston logger
 * @see https://github.com/winstonjs/winston
 */
const winston = require('winston');

const loggerFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`
  ),
);

const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || ((process.env.NODE_ENV === 'production') ? 'info' : 'verbose'),
  transports: [
    new winston.transports.Console({
      format: loggerFormat,
    }),
  ],
});

module.exports = logger;
