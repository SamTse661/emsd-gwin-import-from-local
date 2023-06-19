import moment from "moment-timezone";

export const toDbTime = (dateTime = moment()) => (dateTime instanceof Date ? moment(dateTime) : dateTime).format('YYYY-MM-DD HH:mm:ss')

export const toDateString = (dateTime = moment()) => (dateTime instanceof Date ? moment(dateTime) : dateTime).format('YYYYMMDD')
