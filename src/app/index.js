import {toDbTime} from "./utils/time";
import {ensureDirectory, keepFilesForThreeMonths,} from "./services/outputHandler";
import {logger} from "./services/logger";
import {executeApi} from "./services/http";
import {convertToJSON} from "./utils/xml2json";
import {HongKongTimezone} from "./utils/Const";
import {getAllSensorLatestStatus} from "./repositories/hisApi";
import {convertToGwinFormat} from "./services/recordsService";
import {cleanUpRecords} from "./services/hisService";
import moment from "moment-timezone";
import {insertSensorAPI} from "./repositories/dashboardApi";
import axios from "axios";
import { insertSensorData } from "./repositories/rawRecordRepository";
import {getRandomId} from "./utils/random";

const logDuration = parseInt(process.env.LOG_DURATION) || 120;

const main = async () => {
	// TODO: Ensures that the directory exists. If the directory structure does not exist, it is created
	ensureDirectory();
	logger.info("Retrieve data from HIS");

	// TODO: set the time period for data going to be collected
	const currentTime = moment.tz(HongKongTimezone);
	// const endTime = currentTime.clone().startOf("minute").add(5, 'seconds');
	// const startTime = endTime.clone().add(-(logDuration + 5), "seconds");
	// const endTime = currentTime.clone().startOf("minute").add(logDuration, 'seconds');
	// const startTime = endTime.clone().add(-(logDuration+logDuration), "seconds");
	const endTime = currentTime.clone().endOf('day');
	const startTime = endTime.clone().startOf('year');
	logger.info("data from: " + toDbTime(startTime) + " to: " + toDbTime(endTime));

	// TODO: retrieve data from HIS API
	logger.info("retrieving data");
	const authRes = await axios.post('https://emsd-gwin-smartdrainage.hkmci.net/api/sys/auth/token', 
		{
			username: 'admin',
			password: 'admin@2021'

		});

	const token = authRes.data?.result?.token;

	const stationRes = await axios.get('https://emsd-gwin-smartdrainage.hkmci.net/api/gwinController/getSensorList', 
		{ params: { 
			pageNo: 1,
			pageSize: 100,
		},
		headers: {
			'X-Access-Token': token
		}
	});

	const stationList = stationRes.data.result;
	const stationIDList = [];
	for(let i=0;i<stationList.length;i++){
		stationIDList.push(stationList[i].stationId);
	}

	console.log(`startTime`,startTime.format('YYYY-MM-DD HH:mm:ss'));
	console.log(`endTime`,endTime.format('YYYY-MM-DD HH:mm:ss'));


	const sensorDataList = [];

	for(let i=0;i<stationIDList.length;i++){

		const res = await axios.get('https://emsd-gwin-smartdrainage.hkmci.net/api/gwinController/getSensorDataByDate', 
		{ params: { 
			stationId: stationIDList[i],
			startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
			endTime: endTime.format('YYYY-MM-DD HH:mm:ss')
		},
		headers: {
			'X-Access-Token': token
		}
	});

	console.log(`${stationIDList[i]}: `,res.data.result)
	if(res.data.result.length == 0)
		continue;

	res.data.result.map( async (sensor, index)=>{
		sensorDataList.push( [
			`${sensor.id}`.substring(0,12) + `${String(Math.floor(Math.random()*100000)).padStart(6, '0')}`,
			sensor.waterLevel,
			sensor.rainFall,
			sensor.battery,
			sensor.rssi,
			sensor.snr,
			sensor.validSampleNum,
			sensor.distanceMeadured,
			sensor.cycloneSignal,
			sensor.rainstormWarningSignal,
			sensor.voltage,
			sensor.updateTime,
			sensor.createTime,
			sensor.isDel,
			sensor.altitude,
			sensor.stationId,
			sensor.deviceEui,
			sensor.rainGaugeDrop,
			sensor.temperature,
			sensor.humidity,
			sensor.activity,
			sensor.illumination,
			sensor.infrared,
			sensor.infraredAndVisible,
			sensor.deviceType,
			sensor.lowBattery,
			sensor.reportType,
			sensor.waterLeakOne,
			sensor.waterLeakTwo,
			sensor.status,
			sensor.adcRawValue,
			sensor.currentOne,
			sensor.fineCurrent,
		]);
	})
	}

	for(let i=0;i<sensorDataList.length;i++){
		await insertSensorData(`INSERT INTO sensor_data (id, water_level, rain_fall, battery, rssi, snr, valid_sample_num, distance_meadured, cyclone_signal, rainstorm_warning_signal, voltage, update_time, create_time, is_del, altitude, station_id, device_eui, rain_gauge_drop, temperature, humidity, activity, illumination, infrared, infrared_and_visible, device_type, low_battery, report_type, water_leak_one, water_leak_two, status, adc_raw_value, current_one, fine_current) VALUES (?)`, [sensorDataList[i]])

	}
	console.log(`Completed`)
	return;

};

export default main;
export const clear = () => {
};