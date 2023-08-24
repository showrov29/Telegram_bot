const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const { handleDoc } = require("./helper/handleDoc");

const { checkForNewNotices } = require("./helper/checkNotice");
const { downloadAudio } = require("./helper/youtubeDownload");

// Replace 'YOUR_TOKEN' with your bot's API token
const TOKEN = process.env.BOT_TOKEN;

const bot = new TelegramBot(TOKEN, {
	polling: true,
});

// Set interval to periodically check for new notices
const intervalMinutes = 30; // Set the interval in minutes
setInterval(() => {
	checkForNewNotices(bot);
}, intervalMinutes * 60 * 1000);

// Command handler for /start command
bot.onText(/\/start/, (msg) => {
	const chatId = msg.chat.id;
	bot.sendMessage(
		chatId,
		"Hello! I'm your bot. Send me a message or a document."
	);
});
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
		downloadAudio(bot, msg);
	}
});

console.log("Bot is running...");
