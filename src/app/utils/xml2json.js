import {parseString} from "xml2js";
import {logger} from "../services/logger";

const options = {
	explicitRoot: false,
	explicitArray: false,
	ignoreAttrs: true,
	trim: true,
	tagNameProcessors: [
		(name) => name.toLowerCase(),
	],
}

// TODO: convert xml into json format
export const convertToJSON = (xmlSource) => new Promise((resolve, reject) =>
	parseString(xmlSource, options, (err, parsedData) => {
			if (err || !'soap:body' in parsedData) {
				if (err) {
					logger.error(err)
				}

				return reject(err)
			}

			return resolve(parsedData["soap:body"])
		}
	))
