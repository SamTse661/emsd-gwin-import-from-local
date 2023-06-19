import axios from "axios";
import {HttpsProxyAgent} from "hpagent";
import {logger} from "./logger";

const httpProxyConfig = process.env.HTTP_PROXY;
const rejectUnauthorized = process.env.HTTP_PROXY_REJECT_UNAUTHORIZED ?? true
const httpsAgent = httpProxyConfig ? new HttpsProxyAgent({
	proxy: httpProxyConfig,
	rejectUnauthorized,
}) : null;

export const apiBase = axios.create({
	httpsAgent,
	validateStatus: () => true,
});

export const executeApi = async (apiCall, retryTimes = 3, retryDelay = 300) => {
	let result = null;
	let error = null;

	try {
		result = await apiCall();

		if (result) {
			return result;
		}
	} catch (e) {
		error = e;
		logger.error(e);
	}

	let retry = 0;

	while (retry < retryTimes) {
		await new Promise((resolve) => setTimeout(resolve, retryDelay));

		try {
			result = await apiCall();

			if (result) {
				return result;
			}
		} catch (e) {
			error = e;
			logger.error(e);
		}

		retry++;
	}

	if (error) {
		throw error;
	}
};
