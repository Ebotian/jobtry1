import puppeteer from "puppeteer";

const siteConfigs = {
	"thepaper.cn": {
		listUrl: "https://www.thepaper.cn/",
		selector: "a.index_inherit__A1ImK",
	},
	"jiemian.com": {
		listUrl: "https://www.jiemian.com/lists/801.html",
		selector:
			"li.card-list div.card-list__detail div.card-list__content div.card-list__summary a.logStore p", // 精确到新闻标题的选择器
	},
	"bjnews.com.cn": {
		listUrl: "https://www.bjnews.com.cn/news",
		selector: "div.pin_demo a div.pin_tit",
	},
};

export const crawl = async (taskConfig) => {
	const { site, useProxy } = taskConfig;
	const config = siteConfigs[site];
	if (!config) throw new Error("Unsupported site");

	// 判断是否需要代理
	const launchOptions = {
		headless: "new",
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	};
	if (useProxy || process.env.PUPPETEER_USE_PROXY === "1") {
		launchOptions.args.push("--proxy-server=http://127.0.0.1:7890");
	}

	const browser = await puppeteer.launch(launchOptions);
	const page = await browser.newPage();
	await page.goto(config.listUrl, { waitUntil: "networkidle2" });

	// 自动下拉页面，加载更多新闻
	for (let i = 0; i < 5; i++) {
		await page.evaluate(() => window.scrollBy(0, window.innerHeight));
		await new Promise((r) => setTimeout(r, 1000));
	}

	// 针对不同站点自定义爬取逻辑
	let news;
	if (site === "bjnews.com.cn") {
		// 新京报特殊处理
		news = await page.evaluate((selector) => {
			const items = [];
			document.querySelectorAll(selector).forEach((titleDiv) => {
				const title = titleDiv.innerText.trim();
				// 向上查找 a 标签获取链接
				let a = titleDiv.closest("a");
				const link = a ? a.href : "";
				if (title && link) items.push({ title, link });
			});
			return items;
		}, config.selector);
	} else if (site === "jiemian.com") {
		// 界面新闻特殊处理
		news = await page.evaluate((selector) => {
			const items = [];
			document.querySelectorAll(selector).forEach((p) => {
				const title = p.innerText.trim();
				// 向上查找 a 标签获取链接
				let a = p.closest("a.logStore");
				const link = a ? a.href : "";
				if (title && link) items.push({ title, link });
			});
			return items;
		}, config.selector);
	} else {
		// 默认处理
		news = await page.evaluate((selector) => {
			const items = [];
			document.querySelectorAll(selector).forEach((a) => {
				const title = a.querySelector("h2")?.innerText.trim();
				const link = a.href;
				if (title && link) items.push({ title, link });
			});
			return items;
		}, config.selector);
	}

	await browser.close();
	return news;
};

if (process.env.NODE_ENV === "test") {
	(async () => {
		try {
			// 本地测试时可通过参数或环境变量控制是否用代理
			const news = await crawl({ site: "bjnews.com.cn", useProxy: true });
			console.log("抓取到的新闻数量：", news.length);
			console.log("前几条：", news.slice(0, 5));
		} catch (err) {
			console.error("爬虫测试出错：", err);
		}
	})();
}
