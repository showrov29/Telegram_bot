const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const request = require("request");
const FileHistory = require("../model/documentTrack");
const handleDoc = async (msg, bot) => {
	const fileExist = await FileHistory.findOne({ userId: msg.from.id });
	const fileId = fileExist.fileId;
	const fileName = fileExist.fileName;
	const chatId = msg.from.id;

	bot.getFileLink(fileId).then((fileLink) => {
		request
			.get(fileLink)
			.pipe(fs.createWriteStream(fileName))
			.on("close", () => {
				if (fileName.endsWith(".pdf")) {
					// Handle PDF files
					fs.readFile(fileName, (err, data) => {
						if (!err) {
							pdf(data).then((parsedData) => {
								sendLargeMessage(
									chatId,
									`You sent a PDF document:\n${parsedData.text}`,
									bot
								);
							});
						}
						fs.unlinkSync(fileName);
					});
				} else if (fileName.endsWith(".docx")) {
					// Handle DOCX files
					mammoth
						.extractRawText({ path: fileName })
						.then((result) => {
							sendLargeMessage(
								chatId,
								`You sent a DOCX document:\n${result.value}`,
								bot
							);
							fs.unlinkSync(fileName);
						})
						.catch((err) => {
							console.error(err);
							fs.unlinkSync(fileName);
						});
				} else {
					// Handle other types of files

					bot.sendMessage(chatId, `You sent a file: ${fileName}`);
					fs.unlinkSync(fileName);
				}
			});
	});
};

const sendLargeMessage = async (chatId, message, bot) => {
	const chunkSize = 20000; // Set the desired chunk size
	const chunks = message?.match(new RegExp(`.{1,${chunkSize}}`, "g"));

	if (chunks) {
		chunks.forEach((chunk, index) => {
			setTimeout(() => {
				bot.sendMessage(chatId, chunk);
			}, index * 1000); // Delay each chunk by 1 second
		});
	}
};

module.exports = { handleDoc };
