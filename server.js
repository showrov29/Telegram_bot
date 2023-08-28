const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const { handleDoc } = require("./helper/handleDoc");

const { checkForNewNotices } = require("./helper/checkNotice");
const { downloadAudio } = require("./helper/youtubeDownload");
const mongoose = require("mongoose");
const { saveFile } = require("./services/files");
const { generateOpenAiResponse, generateImage } = require("./helper/openAi");
const { doOperationWithAI } = require("./helper/fileReadOpenAi");

// Replace 'YOUR_TOKEN' with your bot's API token
const TOKEN = process.env.BOT_TOKEN;

const dbConnect = () => {
	mongoose.connect(process.env.MONGO_URL).then(() => console.log("Connected!"));
};
const bot = new TelegramBot(TOKEN, {
	polling: true,
});
if (bot) {
	console.log("Bot is running...");
	dbConnect();
}

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
		"Hello! I'm your bot. Send me a message or a document. Here are the list of commands you can send\n - generate/ [type anything  like chatGPT to get response]"
	);
});
// Message handler
bot.on("message", async (msg) => {
	const chatId = msg.from.id;
	console.log("Message received from " + msg.from.first_name);
	if (msg.document) {
		saveFile(msg);
	}

	// Check if the received message is a text message
	if (msg.text) {
		if (msg.text.toLocaleLowerCase().startsWith("/read")) {
			await handleDoc(msg, bot);
		}
		if (msg.text.toLocaleLowerCase().startsWith("generate/")) {
			const message = msg.text.split("/")[1];
			const response = await generateOpenAiResponse(message);
			bot.sendMessage(chatId, response);
		}
		if (msg.text.toLocaleLowerCase().startsWith("image/")) {
			const message = msg.text.split("/")[1];
			const response = await generateImage(message);
			bot.sendPhoto(chatId, response);
		}
		if (msg.text.toLocaleLowerCase().startsWith("do/")) {
			const message = msg.text.split("/")[1];
			await doOperationWithAI(msg, bot, message);
		}
		downloadAudio(bot, msg);
	}
});
