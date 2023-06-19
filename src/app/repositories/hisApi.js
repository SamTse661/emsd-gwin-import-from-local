import {apiBase} from "../services/http";
import {exec} from "child_process";
import {logger} from "../services/logger";

const hisHostname = process.env.API_HIS_HOSTNAME;
const hisUsername = process.env.API_HIS_USERNAME;
const hisPassword = process.env.API_HIS_PASSWORD;
const nodeEnv = process.env.NODE_ENV;

// TODO: update response codes
const responseCode = {
	1000: "Request Success",
	9000: "Unknown error",
	9001: "Unauthorized IP Address",
	9002: "Unauthorized User or Password",
	9003: "Permission Denied to access station",
	9004: "Missing or Invalid Parameter",
	9005: "Invalid Station",
	9006: "Date Time out of range",
	9007: "Data is Exist",
	9008: "Unsupported or invalid sensor type",
};

const generateXmlPostTemplate = (functionName) => {
	return `<Envelope xmlns="http://www.w3.org/2003/05/soap-envelope">
      <Body>
          <${functionName} xmlns="http://tempuri.org/">
              <SystemID>${hisUsername}</SystemID>
              <Password>${hisPassword}</Password>
          </${functionName}>
      </Body>
  </Envelope>`;
	// return `<Envelope xmlns="http://www.w3.org/2003/05/soap-envelope"><Body><${functionName} xmlns="http://tempuri.org/"><SystemID>${hisUsername}</SystemID><Password>${hisPassword}</Password></${functionName}></Body></Envelope>`;
};

const getXmlSourceUrl = () => `${hisHostname}/external_API/StationWS.asmx`;

export const getAllSensorLatestStatus = async () => {
	const xmlBody = generateXmlPostTemplate("getAllStationRealTimeSensorData");

	let response = []

	if(nodeEnv === "production"){
		const command = 'curl -X POST -H \'Content-type: text/xml\' -d \'' + xmlBody + '\' ' + getXmlSourceUrl()
		logger.info("command: " + command);
		response.data = await new Promise((resolve, reject) => {
			exec(command, (error, stdout, stderr) => {
			if (error) {
			    reject(stderr)
			}
			if (stderr) {
			    console.log(stderr)
			}
			resolve(stdout)
		    })
		})
	}
	else {
		response = await apiBase.post(getXmlSourceUrl(), xmlBody, {
			headers: {"Content-Type": "text/xml"},
		});
	}

	if (!response.data) {
		throw new Error("his call failed");
	}

	const codeMatches = /<ResponseCode>(.+)<\/ResponseCode>/.exec(response.data);
	if (!codeMatches) {
		throw new Error("Unknown response, " + response.data);
	}

	const message = responseCode[codeMatches[1]];
	if (message !== responseCode["1000"]) {
		throw new Error(message);
	}
	return response.data;
};
