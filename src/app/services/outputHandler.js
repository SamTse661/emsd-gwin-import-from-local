import {sep} from "path";
import {readdir, stat, unlink} from "fs";
import {ensureDirSync, ensureFileSync} from "fs-extra";
import {logger} from "./logger";

// TODO: create the output folder
const exportPath = process.env.EXPORT_PATH ?? 'output';

export const outputFolder = `.${sep}${exportPath}`;
export const logFolder = `.${sep}log`;
export const ensureDirectory = () => {
	ensureDirSync(outputFolder);
	ensureDirSync(logFolder);
};

export const ensureOutputFile = (filePath) => ensureFileSync(filePath);

export const keepFilesForThreeMonths = async () => {
	const threeMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 90;

	const files = await new Promise((resolve, reject) =>
		readdir(outputFolder, (err, files) => (err ? reject(err) : resolve(files)))
	);

	await Promise.all(
		files.map((f) => removeWhenMoreThanThreeMonths(f, threeMonthsAgo))
	);
};

const removeWhenMoreThanThreeMonths = async (filePath, compareTime) => {
	const fullFilePath = `${outputFolder}${sep}${filePath}`;
	try {
		const stats = await new Promise((resolve, reject) =>
			stat(fullFilePath, (err, stats) => (err ? reject(err) : resolve(stats)))
		);
		if (stats.mtimeMs < compareTime) {
			unlink(fullFilePath, (err) => logger.error(err));
		}
	} catch (e) {
		logger.error(e);
	}
};
