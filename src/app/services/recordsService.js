import moment from "moment-timezone";
import {isFilterStation, isFilterStationUsePressure} from "../repositories/dashboardApi";

// From:
// { "station_id": "D14",
// 	"unit_id": "1015",
// 	"name": "Shan Pui Chung Hau Tsuen",
// 	"northing": 22.452378979833753,
// 	"easting": 114.0289314690952,
// 	"time": "2022-06-09T11:50:00.000Z",
// 	"sensor": {
// 	"AC power": "1",
// 		"Battery": "12.62",
// 		"Ultrasound": "1.4"
// }

const stringToFloat = (v) => {
	try {
		return parseFloat(v)
	}
	catch(e) {
		return 0
	}
}

const levelToDistance = (level, offset) => {
	level = stringToFloat(level)
	offset = stringToFloat(offset)

	return Math.round((level - offset) * -1000)
}

export const convertToGwinFormat = (record) => {
	if(!record.station_id || !record.northing || !record.easting || (!record.sensor?.Ultrasound && record.sensor?.Pressure && !isFilterStationUsePressure(record.station_id))) {
		return null
	}

	if(isFilterStation(record.station_id)) {
		return null
	}

	const objectJSON = {
		waterLevel: record.sensor?.Ultrasound ? record.sensor.Ultrasound:(record.sensor?.Level ? record.sensor.Level:(record.sensor.WaterLevel ? record.sensor.WaterLevel:record.sensor.Pressure)),
		// distance: levelToDistance(record.sensor.Ultrasound, '0'),
		version: 2,
		rainGaugeDrop: record.sensor?.Raingauge
	}
	

	if(record?.sensor?.Battery) {
		objectJSON.batteryVoltage = stringToFloat(record?.sensor?.Battery)
	}

	if(record?.sensor?.Ultrasound) {
		objectJSON.ultrasonic = stringToFloat(record?.sensor?.Ultrasound)
	}

	if(record?.sensor?.Pressure) {
		objectJSON.pressure = stringToFloat(record?.sensor?.Pressure)
	}

	return {
		publishedAt: moment(record.time).utc().format('YYYY-MM-DDTHH:mm:ss.SSSSSSSSS[Z]'),
		deviceName: record.station_id,
		devEUI: 'HIS' + record?.unit_id,
		tags: {
			StationID: record.station_id,
			Latitude: record.northing,
			Longitude: record.easting,
			Location: record.name
		},
		objectJSON: JSON.stringify(objectJSON),
	}
}
