import winston, {createLogger,} from "winston"
import 'winston-daily-rotate-file'
import {sep} from 'path'

const logFolder = `.${sep}logs`
const filename = `${logFolder}${sep}log-%DATE%.log`
// const filename = `${logFolder}${sep}log-${toDateString(moment.tz(HongKongTimezone))}.log`

const transport = new winston.transports.DailyRotateFile({
	filename,
	datePattern: 'YYYYMMDD',
	zippedArchive: true,
	maxSize: '100m',
	maxFiles: '90d'
});

export const logger = createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.errors(),
		winston.format.timestamp(),
		winston.format.json(),
	),
	transports: [
		new winston.transports.Console(),
		transport,
		// new winston.transports.File({filename})
	]
})
