import { Snowflake } from 'nodejs-snowflake'

const uid = new Snowflake();

export const getRandomId = () => uid.idFromTimestamp(Date.now())
