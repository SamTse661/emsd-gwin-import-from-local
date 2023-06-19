import {apiBase, executeApi} from "../services/http";

const baseURL = process.env.DASHBOARD_BASE_URL;
const username = process.env.DASHBOARD_USERNAME;
const password = process.env.DASHBOARD_PASSWORD;

const sensorInsertUrl = process.env.DASHBOARD_INGRESS_URL;
const sensorInsertUsername = process.env.DASHBOARD_INGRESS_USERNAME;
const sensorInsertPassword = process.env.DASHBOARD_INGRESS_PASSWORD;

// TODO: list out the station ids duplicate to LoRa
const filterStations = [
	'D33', 'D34'
]

// TODO: list out the station ids that are using pressure as water level value
const filterStationsUsePressure = [
	'D07', 'ARQSSS', 'D53', 'D54', 'D56', 'D58', 'D76'
]

export const isFilterStation = (stationId) => filterStations.includes(stationId)

export const isFilterStationUsePressure = (stationId) => filterStationsUsePressure.includes(stationId)

export const loginDashboardAPI = async () => {
	const url = `${baseURL}/sys/auth/token`

	const response = await executeApi(() => apiBase.post(url, {
		username,
		password,
	}))

	return response?.data?.result?.token
}

export const insertSensorAPI = async (record) => {
	await executeApi(() => apiBase.post(sensorInsertUrl, record, {
		auth: {
			username: sensorInsertUsername,
			password: sensorInsertPassword,
		},
	}))
}
