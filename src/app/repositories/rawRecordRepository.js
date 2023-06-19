import {dbPool} from "../services/db";

export const getRawRecords = (startTime, endTime) => dbPool.execute('SELECT raw_data, create_time, published_at FROM sensor_raw_data LEFT JOIN  sensor_raw_data_extend on sensor_raw_data.id = sensor_raw_data_extend.id WHERE sensor_raw_data.raw_data IS NOT NULL AND sensor_raw_data.create_time between ? and ?;', [startTime, endTime])


export const insertSensorData = (sql, list) => dbPool.query(sql, list, async (err, result)=>{
    const response = await new Promise((resolve, reject) => {

        if(err){
            reject(err)
        }
        resolve(result)

       
    })
    return response;
})
