const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const fs = require("fs");
const request = require("request");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const axios = require("axios");
const cheerio = require("cheerio");
const OpenAI = require("openai");

// Replace 'YOUR_TOKEN' with your bot's API token
const TOKEN = process.env.BOT_TOKEN;

const openai = new OpenAI({
	apiKey: process.env.OPENAI_TOKEN, // defaults to process.env["OPENAI_API_KEY"]
});

const bot = new TelegramBot(TOKEN, {
	polling: true,
});

const websiteURL = "https://www.aiub.edu/category/notices";

// Keep track of previously notified notices
const notifiedNotices = new Set();

// Function to check for new notices
async function checkForNewNotices() {
	try {
		const response = await axios.get(websiteURL);
		const $ = cheerio.load(response.data);

		// Extract and process notices
		$("ul.event-list li").each((index, element) => {
			const day = $(element).find("time span.day").text().trim();
			const month = $(element).find("time span.month").text().trim();
			const link = $(element).find("a.info-link").attr("href");
			const title = $(element).find("div.info h2").text().trim();

			const noticeText = `Time: ${day} ${month} \nTitle: ${title}\nLink: https://www.aiub.edu/${link}`;

			if (!notifiedNotices.has(noticeText)) {
				// Send notification for new notice
				bot.sendMessage(1628337716, `New notice: ${noticeText}`);
				notifiedNotices.add(noticeText);
			}
		});
	} catch (error) {
		console.error("Error fetching or parsing website:", error);
	}
}

// Set interval to periodically check for new notices
const intervalMinutes = 30; // Set the interval in minutes
setInterval(checkForNewNotices, intervalMinutes * 60 * 1000);

function sendLargeMessage(chatId, message) {
	const chunkSize = 4000; // Set the desired chunk size
	const chunks = message.match(new RegExp(`.{1,${chunkSize}}`, "g"));

	if (chunks) {
		chunks.forEach((chunk, index) => {
			setTimeout(() => {
				bot.sendMessage(chatId, chunk);
			}, index * 1000); // Delay each chunk by 1 second
		});
	}
}
// Command handler for /start command

// Message handler
bot.on("message", (msg) => {
	const chatId = msg.from.id;

	if (msg.document) {
		// bot.sendMessage(chatId, msg.document.mime_type);
		const fileId = msg.document.file_id;
		const fileName = msg.document.file_name;

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
										`You sent a PDF document:\n${parsedData.text}`
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
									`You sent a DOCX document:\n${result.value}`
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
	}

	// Check if the received message is a text message
	if (msg.text) {
		bot.sendMessage(com, msg.text);
	}
});

console.log("Bot is running...");
