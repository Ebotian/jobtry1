import * as aiService from "../services/aiService.js";

export const chat = async (req, res, next) => {
	try {
		const { context, input } = req.body;
		const reply = await aiService.deepseekChat(context || [], input || "");
		res.json({ reply });
	} catch (err) {
		next(err);
	}
};
