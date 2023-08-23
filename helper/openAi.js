const { OpenAI } = require("openai");
const openai = new OpenAI({
	apiKey: process.env.OPENAI_TOKEN, // defaults to process.env["OPENAI_API_KEY"]
});
const demo = async () => {
	const response = await openai.chat.completions.create({
		messages: [{ role: "user", content: "Say this is a test" }],
		model: "ext-davinci-003",
		temperature: 1,
	});

	console.log(response.choices);
};

module.exports = { demo };
