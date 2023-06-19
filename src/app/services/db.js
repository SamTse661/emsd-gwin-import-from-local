import {createPool} from "mysql2/promise"

const host = process.env.DB_HOST ?? 'localhost'
const port = process.env.DB_PORT ?? 3306
const user = process.env.DB_USERNAME ?? ''
const password = process.env.DB_PASSWORD ?? ''
const database = process.env.DB_DATABASE ?? ''
const connectionLimit = process.env.DB_MAX_CONN ?? 3

export const dbPool = createPool({
	host,
	port,
	user,
	password,
	database,
	waitForConnections: true,
	connectionLimit,
	queueLimit: 0,
})

export const closePool = () => dbPool.end()

