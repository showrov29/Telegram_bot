const { OpenAI } = require("openai");
const openai = new OpenAI({
	apiKey: process.env.OPENAI_TOKEN, // defaults to process.env["OPENAI_API_KEY"]
});
const generateOpenAiResponse = async (userMessage) => {
	console.log(userMessage);
	const response = await openai.chat.completions.create({
		messages: [{ role: "user", content: userMessage }],
		model: "gpt-3.5-turbo",
		temperature: 1,
	});

	return response.choices[0].message.content;
};

const generateImage = async (userMessage) => {
	const response = await openai.images.generate({
		prompt: userMessage,
		n: 5,
		size: "256x256",
	});
	return (image_url = response.data[0].url);
};

module.exports = { generateOpenAiResponse, generateImage };
