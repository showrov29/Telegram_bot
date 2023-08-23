const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const axios = require("axios");
const cheerio = require("cheerio");
const OpenAI = require("openai");
const { handleDoc } = require("./helper/handleDoc");

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

// Command handler for /start command

// Message handler
bot.on("message", async (msg) => {
	const chatId = msg.from.id;

	if (msg.document) {
		// bot.sendMessage(chatId, msg.document.mime_type);
		// bot.sendMessage(chatId,);
		await handleDoc(msg, bot);
	}

	// Check if the received message is a text message
	if (msg.text) {
		bot.sendMessage(chatId, msg.text);
	}
});

console.log("Bot is running...");
