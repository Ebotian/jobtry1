import puppeteer from "puppeteer";

const siteConfigs = {
  "thepaper.cn": {
    listUrl: "https://www.thepaper.cn/",
    selector: "a.index_inherit__A1ImK",
  },
};

export const crawl = async (taskConfig) => {
  const { site, useProxy } = taskConfig;
  const config = siteConfigs[site];
  if (!config) throw new Error("Unsupported site");

  // 判断是否需要代理
  const launchOptions = {
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
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
    await new Promise(r => setTimeout(r, 1000));
  }

  const news = await page.evaluate((selector) => {
    const items = [];
    document.querySelectorAll(selector).forEach((a) => {
      const title = a.querySelector("h2")?.innerText.trim();
      const link = a.href;
      if (title && link) items.push({ title, link });
    });
    return items;
  }, config.selector);

  await browser.close();
  return news;
};

if (process.env.NODE_ENV === "test") {
  (async () => {
    try {
      // 本地测试时可通过参数或环境变量控制是否用代理
      const news = await crawl({ site: "thepaper.cn", useProxy: true });
      console.log("抓取到的新闻数量：", news.length);
      console.log("前几条：", news.slice(0, 5));
    } catch (err) {
      console.error("爬虫测试出错：", err);
    }
  })();
}