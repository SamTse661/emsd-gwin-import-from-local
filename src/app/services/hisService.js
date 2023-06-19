import moment from "moment-timezone";
import {HongKongTimezone} from "../utils/Const";
import {convertToWsg84} from "../utils/geo";
import {logger} from "./logger";

const valueType = {
	R: 'Raingauge',
	W: 'Water Level',
	T: 'Tempeture',
	F: 'Flow',
	V: 'Velocity',
	P: 'Pressure',
	U: 'Ultrasound',
	A: 'AC power',
	S: 'Solar',
	B: 'Battery',
	SNR: 'Signal Quality',
	L: 'Level',
}

const getValueType = (type) => type in valueType ? valueType[type] : type

const getRecordTime = (item) => {
	if (Array.isArray(item.sensor)) {
		if (!item.sensor[0]?.sensordata || !item.sensor[0]?.sensordata?.datetime) {
			return null
		}

		return moment.tz(item.sensor[0].sensordata.datetime, HongKongTimezone)
	} else {
		if (!item.sensor?.sensordata || !item.sensor?.sensordata?.datetime) {
			return null
		}

		return moment.tz(item.sensor.sensordata.datetime, HongKongTimezone)
	}
}

const getRecordValues = (item) => {
	const sensor = {}

	if (Array.isArray(item?.sensor)) {
		for (const rawValue of item?.sensor) {
			sensor[getValueType(rawValue.type)] = rawValue?.sensordata?.value
		}
	} else {
		sensor[getValueType(item?.sensor?.type)] = item?.sensor?.sensordata?.value
	}

	return sensor
}

export const cleanUpRecords = (data, startTime, endTime) => {
	const {stationlatestdata} = data.getallstationrealtimesensordataresponse.result.stations;

	return stationlatestdata.map((item) => {
		try {
			if (!item || !item.sensor || item.sensor.length === 0) {
				return null;
			}

			const time = getRecordTime(item)

			if (!time || time < startTime || time > endTime) {
				return null
			}

			if (item?.easting && item?.northing) {
				[item.easting, item.northing] = convertToWsg84(
					parseInt(item.northing),
					parseInt(item.easting)
				);
			}

			return {
				station_id: item?.station_id,
				unit_id: item?.unit_id,
				name: item?.name,
				northing: item?.northing,
				easting: item?.easting,
				time: time.toISOString(),
				sensor: getRecordValues(item),
			}
		} catch (e) {
			logger.error(e)
			return null
		}
	}).filter((item) => !!item)
};