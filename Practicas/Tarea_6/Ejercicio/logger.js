// logger.js

import winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || 'debug',
	format: combine(
		colorize({ all: true }),
		timestamp({
			format: 'YYYY-MM-DD hh:mm:ss',
		}),
		align(),
		printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: 'app.log',
			level: 'info',
		}),		
	],
});

export default logger;
