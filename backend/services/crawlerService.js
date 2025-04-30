import axios from "axios";
import cheerio from "cheerio";

// 支持多站点新闻抓取
const siteConfigs = {
  "thepaper.cn": { listUrl: "https://www.thepaper.cn/list_page/newsList", selector: ".news_li" },
  // 你可以继续补充其他站点配置
};

export const crawl = async (taskConfig) => {
  const { site } = taskConfig;
  const config = siteConfigs[site];
  if (!config) throw new Error("Unsupported site");

  const { data } = await axios.get(config.listUrl);
  const $ = cheerio.load(data);
  const news = [];
  $(config.selector).each((i, el) => {
    news.push({
      title: $(el).find(".news_title").text(),
      link: $(el).find("a").attr("href"),
    });
  });
  return news; // 返回原始新闻数据
};