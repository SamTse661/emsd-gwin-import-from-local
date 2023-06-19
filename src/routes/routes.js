const express = require('express');
const router = express.Router();
const axios = require('axios');


import {toDbTime} from "../app/utils/time";
import {ensureDirectory, keepFilesForThreeMonths,} from "../app/services/outputHandler";
import {logger} from "../app/services/logger";
import {executeApi} from "../app/services/http";
import {convertToJSON} from "../app/utils/xml2json";
import {HongKongTimezone} from "../app/utils/Const";
import {getAllSensorLatestStatus} from "../app/repositories/hisApi";
import {convertToGwinFormat} from "../app/services/recordsService";
import {cleanUpRecords} from "../app/services/hisService";
import moment from "moment-timezone";
import {insertSensorAPI} from "../app/repositories/dashboardApi";

//Get all Method
router.get('/importFromUatToLocal', async (req, res) => {
    try {
        const env = process.env.NODE_ENV;
        if(env == 'local'){
        axios({
            method: 'get',
            url: 'https://emsd-gwin-smartdrainage.hkmci.net/uatImportHisToLocal/importFromUatToLocal',
        })
        .then( async (response)=> {
            console.log(`res`,response)
            try{
                const result = insertSensorAPI(response);
                await Promise.allSettled([result]);
        
            }catch(e){
                logger.error(`API Insert Error:`,e)
            }
            // writeRecordFromHis(data, outputFilePathPrefix);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        });
        }else if(env == 'uat'){

            logger.info("Retrieve data from HIS");
            const currentTime = moment.tz(HongKongTimezone);
            const endTime = currentTime.clone().startOf("minute").add(logDuration, 'seconds');
            const startTime = endTime.clone().add(-(logDuration+logDuration), "seconds");
            logger.info("data from: " + toDbTime(startTime) + " to: " + toDbTime(endTime));
            logger.info("retrieving data");
            const data = await executeApi(() => getAllSensorLatestStatus());
            logger.info("exporting data");
            const recordsJson = await convertToJSON(data)
            const records = cleanUpRecords(recordsJson, startTime, endTime)
            const gwinRecords = records.map((r) => convertToGwinFormat(r)).filter((r) => !!r)
            console.log(gwinRecords)
        
            logger.info('Records count: ' + gwinRecords.length);
            logger.info('StationIds: ' + gwinRecords.map((r) => r.deviceName).join(','));
        
            const sensorInfoList = {
                "sensorInfo": gwinRecords
            }

            console.log(`sensorInfoList`,sensorInfoList)
            res.json(sensorInfoList);
        }


        res.json({})
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})
module.exports = router;
