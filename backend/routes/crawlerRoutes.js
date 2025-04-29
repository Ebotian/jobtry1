import express from "express";
import crawlerService from "../services/crawlerService.js";

const router = express.Router();

// POST /api/crawler
router.post("/", async (req, res) => {
	const { keywords, type = "weibo", ...extra } = req.body;
	if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
		return res.status(400).json({ error: { message: "缺少关键词" } });
	}
	try {
		const result = await crawlerService.run(type, { keywords, ...extra });
		res.json(result);
	} catch (e) {
		res.status(500).json({ error: { message: e.message } });
	}
});

export default router;
