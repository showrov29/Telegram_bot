const { OpenAI } = require("openai");
const openai = new OpenAI({
	apiKey: process.env.OPENAI_TOKEN, // defaults to process.env["OPENAI_API_KEY"]
});
const demo = async (userMessage) => {
	const response = await openai.chat.completions.create({
		messages: [{ role: "user", content: userMessage }],
		model: "gpt-3.5-turbo",
		temperature: 1,
	});

	return response.choices[0].message.content;
};

module.exports = { demo };
