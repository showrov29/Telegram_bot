const ytdl = require("ytdl-core");
const concat = require("concat-stream");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const downloadAudio = async (bot, msg) => {
	const chatId = msg.chat.id;
	const text = msg.text;
	const tempDir = path.join(__dirname, "temp");
	if (text.startsWith("/download")) {
		if (text.startsWith("/download")) {
			const videoUrl = text.split(" ")[1];

			if (ytdl.validateURL(videoUrl)) {
				// Get video information
				const info = await ytdl.getInfo(videoUrl);
				const videoTitle = info.videoDetails.title;

				// Create the downloads directory if it doesn't exist
				const downloadsDirectory = path.join(__dirname, "downloads");
				if (!fs.existsSync(downloadsDirectory)) {
					fs.mkdirSync(downloadsDirectory);
				}

				// Download audio
				const audioStream = ytdl(videoUrl, { quality: "highestaudio" });
				const filePath = path.join(downloadsDirectory, `${videoTitle}.mp3`);

				audioStream.pipe(fs.createWriteStream(filePath));

				// Notify the user
				bot.sendMessage(chatId, `Downloading audio ...`);

				audioStream.on("end", () => {
					// Send the downloaded audio as a reply
					bot.sendAudio(chatId, filePath).then(() => {
						// Delete the downloaded file after sending
						fs.unlinkSync(filePath);
					});
				});
			} else {
				bot.sendMessage(chatId, "Invalid YouTube URL.");
			}
		} else {
			bot.sendMessage(
				chatId,
				"Send /download followed by a YouTube URL to download audio."
			);
		}
	}
};

module.exports = { downloadAudio };
