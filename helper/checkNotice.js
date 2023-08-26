const axios = require("axios");
const cheerio = require("cheerio");
const websiteURL = "https://www.aiub.edu/category/notices";
const notifiedNotices = new Set();
async function checkForNewNotices(bot) {
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

module.exports = { checkForNewNotices };
