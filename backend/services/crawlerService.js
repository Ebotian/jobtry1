/**
 * 爬虫服务模块 - 基于Crawlee.js的网页数据采集
 * 支持动态页面、多站点适配、代理池和反爬策略
 */

import {
	PlaywrightCrawler,
	CheerioCrawler,
	ProxyConfiguration,
	Dataset,
} from "crawlee";
import { RequestQueue, RequestList } from "crawlee";
import { promises as fs } from "fs";
import path from "path";
import logger from "../utils/logger.js";
import config from "../config/env.js";

/**
 * 网站适配器基类 - 为不同网站提供特定的抓取逻辑
 */
class SiteAdapter {
	constructor(options = {}) {
		this.options = options;
		this.name = "generic";
	}

	/**
	 * 准备URL列表
	 * @param {Object} params - 查询参数
	 * @returns {Array<string>} URL列表
	 */
	async prepareUrls(params) {
		throw new Error("每个适配器必须实现prepareUrls方法");
	}

	/**
	 * 页面处理器
	 * @param {Object} context - 爬虫上下文
	 * @returns {Object} 提取的数据
	 */
	async handlePage(context) {
		throw new Error("每个适配器必须实现handlePage方法");
	}

	/**
	 * 数据后处理
	 * @param {Array<Object>} items - 采集的原始数据
	 * @returns {Array<Object>} 处理后的数据
	 */
	async processResults(items) {
		return items;
	}
}

/**
 * 微博适配器 - 处理微博特定的抓取逻辑
 */
class WeiboAdapter extends SiteAdapter {
	constructor(options = {}) {
		super(options);
		this.name = "weibo";
	}

	/**
	 * 准备微博搜索URL
	 * @param {Object} params - 搜索参数
	 * @returns {Array<string>} URL列表
	 */
	async prepareUrls({ keywords = [], pages = 1 }) {
		return keywords.flatMap((keyword) =>
			Array.from(
				{ length: pages },
				(_, i) =>
					`https://s.weibo.com/weibo?q=${encodeURIComponent(keyword)}&page=${
						i + 1
					}`
			)
		);
	}

	/**
	 * 处理微博页面
	 * @param {Object} context - 爬虫上下文
	 * @returns {Array<Object>} 提取的微博数据
	 */
	async handlePage({ page, request }) {
		await page.waitForSelector(".card-wrap", { timeout: 30000 });

		// 提取微博内容
		const posts = await page.$$eval(".card-wrap:not(.card-top)", (cards) =>
			cards.map((card) => {
				const contentEl = card.querySelector(".txt");
				const userEl = card.querySelector(".name");
				const timeEl = card.querySelector(".from");
				const likeEl = card.querySelector('span[data-click="like"]');

				return {
					content: contentEl ? contentEl.innerText.trim() : "",
					user: userEl ? userEl.innerText.trim() : "",
					time: timeEl ? timeEl.innerText.trim() : "",
					likes: likeEl ? parseInt(likeEl.innerText.trim() || "0") : 0,
					url: request.url,
					source: "weibo",
					keyword: new URL(request.url).searchParams.get("q"),
				};
			})
		);

		return posts;
	}

	/**
	 * 微博特定的数据清洗
	 * @param {Array<Object>} items - 采集的微博数据
	 * @returns {Array<Object>} 清洗后的数据
	 */
	async processResults(items) {
		// 过滤空内容和广告
		return items
			.filter((item) => item.content && item.content.length > 5)
			.filter((item) => !item.content.includes("广告"));
	}
}

/**
 * 新闻网站适配器 - 处理新闻网站特定的抓取逻辑
 */
class NewsAdapter extends SiteAdapter {
	constructor(options = {}) {
		super(options);
		this.name = "news";
		this.sites = options.sites || [
			{
				domain: "news.sina.com.cn",
				title: "h1.main-title",
				content: "div.article",
			},
			{
				domain: "tech.163.com",
				title: "h1.post_title",
				content: "div.post_body",
			},
		];
	}

	/**
	 * 准备新闻站点URL
	 * @param {Object} params - 搜索参数
	 * @returns {Array<string>} URL列表
	 */
	async prepareUrls({ keywords = [], sites = this.sites }) {
		const urls = [];

		// 针对每个关键词构建搜索URL
		for (const keyword of keywords) {
			for (const site of sites) {
				urls.push(
					`https://www.baidu.com/s?q=${encodeURIComponent(keyword)}+site:${
						site.domain
					}`
				);
			}
		}

		return urls;
	}

	/**
	 * 处理新闻搜索结果页面
	 * @param {Object} context - 爬虫上下文
	 * @returns {Array<Object>} 提取的新闻数据
	 */
	async handlePage({ page, request }) {
		// 如果是百度搜索结果页面，则提取新闻链接
		if (request.url.includes("baidu.com")) {
			await page.waitForSelector(".result", { timeout: 30000 });

			const newsLinks = await page.$$eval(".result h3 > a", (links) =>
				links.map((link) => link.href)
			);

			// 仅返回最相关的前5个新闻链接
			return newsLinks.slice(0, 5).map((url) => ({
				url,
				type: "news_link",
				source: "baidu_search",
			}));
		}
		// 如果是具体新闻页面，则提取新闻内容
		else {
			const domain = new URL(request.url).hostname;
			const siteConfig = this.sites.find((site) =>
				domain.includes(site.domain)
			) || {
				title: "h1,h2.title",
				content: ".article,article,.content",
			};

			// 等待内容加载
			try {
				await page.waitForSelector(siteConfig.title, { timeout: 15000 });
			} catch (e) {
				logger.warn(`等待标题选择器超时: ${request.url}`);
			}

			// 提取标题和正文
			const title = await page
				.$eval(siteConfig.title, (el) => el?.innerText.trim())
				.catch(() => "未找到标题");

			const content = await page
				.$eval(siteConfig.content, (el) => el?.innerText.trim())
				.catch(() => "未找到正文");

			// 提取发布时间
			const timePattern =
				/(\d{4}[-年/]\d{1,2}[-月/]\d{1,2}日?(\s\d{1,2}:\d{1,2}(:\d{1,2})?)?)/;
			const pageText = await page.content();
			const timeMatch = pageText.match(timePattern);
			const publishTime = timeMatch ? timeMatch[0] : "未知时间";

			return [
				{
					title,
					content,
					url: request.url,
					publishTime,
					domain,
					source: "news",
					extractTime: new Date().toISOString(),
				},
			];
		}
	}

	/**
	 * 新闻特定的数据清洗
	 * @param {Array<Object>} items - 采集的新闻数据
	 * @returns {Array<Object>} 清洗后的数据
	 */
	async processResults(items) {
		// 过滤出实际新闻内容并排除链接
		const newsItems = items.filter(
			(item) =>
				item.type !== "news_link" && item.content && item.content.length > 100
		);

		// 清理文本
		return newsItems.map((item) => ({
			...item,
			content: item.content
				.replace(/\s+/g, " ")
				.replace(/【.*?】/g, "")
				.trim(),
			title: item.title.trim(),
		}));
	}
}

/**
 * 代理池管理器 - 处理代理IP的轮换和有效性检测
 */
class ProxyManager {
	constructor(options = {}) {
		this.proxyList = options.proxyList || [];
		this.proxyUrls = options.proxyUrls || [];
		this.currentIndex = 0;
		this.retryCount = 0;
		this.maxRetries = options.maxRetries || 3;
		this.proxyCheckUrl =
			options.proxyCheckUrl || "https://api.ipify.org?format=json";
	}

	/**
	 * 初始化代理池
	 * @returns {Promise<void>}
	 */
	async initialize() {
		if (this.proxyList.length === 0 && this.proxyUrls.length > 0) {
			await this.refreshProxyList();
		}
	}

	/**
	 * 从远程地址刷新代理列表
	 * @returns {Promise<void>}
	 */
	async refreshProxyList() {
		try {
			for (const url of this.proxyUrls) {
				const response = await fetch(url);
				const text = await response.text();
				const proxies = text
					.trim()
					.split("\n")
					.map((line) => line.trim())
					.filter(Boolean);

				this.proxyList.push(...proxies);
			}
			logger.info(`代理池已刷新，当前代理数量: ${this.proxyList.length}`);
		} catch (error) {
			logger.error(`刷新代理列表失败: ${error.message}`);
		}
	}

	/**
	 * 获取下一个代理
	 * @returns {string|null} 代理URL
	 */
	getNextProxy() {
		if (this.proxyList.length === 0) {
			return null;
		}

		this.currentIndex = (this.currentIndex + 1) % this.proxyList.length;
		return this.proxyList[this.currentIndex];
	}

	/**
	 * 标记当前代理失效
	 */
	markCurrentProxyInvalid() {
		if (this.proxyList.length === 0) {
			return;
		}

		// 从列表中移除当前代理
		this.proxyList.splice(this.currentIndex, 1);
		if (this.currentIndex >= this.proxyList.length) {
			this.currentIndex = 0;
		}

		// 如果代理数量过低，尝试刷新
		if (this.proxyList.length < 5 && this.retryCount < this.maxRetries) {
			this.retryCount++;
			this.refreshProxyList();
		}
	}

	/**
	 * 创建Crawlee代理配置
	 * @returns {ProxyConfiguration|null}
	 */
	createProxyConfiguration() {
		if (this.proxyList.length === 0) {
			return null;
		}

		return new ProxyConfiguration({
			proxyUrls: this.proxyList,
		});
	}
}

/**
 * 爬虫服务类 - 封装所有爬虫相关功能
 */
class CrawlerService {
	constructor(options = {}) {
		this.adapters = new Map();
		this.adapterOptions = options.adapters || {};

		// 初始化代理管理器
		this.proxyManager = new ProxyManager({
			proxyList: options.proxyList || config.PROXY_LIST || [],
			proxyUrls: options.proxyUrls || config.PROXY_URLS || [],
			maxRetries: options.maxProxyRetries || 3,
		});

		// 注册默认适配器
		this.registerAdapter(
			"weibo",
			new WeiboAdapter(this.adapterOptions.weibo || {})
		);
		this.registerAdapter(
			"news",
			new NewsAdapter(this.adapterOptions.news || {})
		);

		// 爬虫设置项
		this.settings = {
			maxConcurrency: options.maxConcurrency || 2,
			maxRequestsPerMinute: options.maxRequestsPerMinute || 10,
			maxRequestRetries: options.maxRequestRetries || 3,
			navigationTimeoutSecs: options.navigationTimeoutSecs || 60,
		};
	}

	/**
	 * 注册网站适配器
	 * @param {string} name - 适配器名称
	 * @param {SiteAdapter} adapter - 适配器实例
	 */
	registerAdapter(name, adapter) {
		this.adapters.set(name, adapter);
	}

	/**
	 * 获取适配器
	 * @param {string} name - 适配器名称
	 * @returns {SiteAdapter} 适配器实例
	 */
	getAdapter(name) {
		if (!this.adapters.has(name)) {
			throw new Error(`未找到适配器: ${name}`);
		}
		return this.adapters.get(name);
	}

	/**
	 * 为爬虫准备请求队列
	 * @param {string} adapterName - 适配器名称
	 * @param {Object} params - 查询参数
	 * @returns {Promise<RequestList>} 请求列表
	 */
	async prepareRequestList(adapterName, params) {
		const adapter = this.getAdapter(adapterName);
		const urls = await adapter.prepareUrls(params);

		if (urls.length === 0) {
			throw new Error("URL列表为空，无法开始爬取");
		}

		const requests = urls.map((url) => ({ url }));
		return RequestList.open(`${adapterName}-list`, requests);
	}

	/**
	 * 创建Playwright爬虫实例
	 * @param {string} adapterName - 适配器名称
	 * @param {RequestList} requestList - 请求列表
	 * @returns {Promise<PlaywrightCrawler>} 爬虫实例
	 */
	async createCrawler(adapterName, requestList) {
		const adapter = this.getAdapter(adapterName);
		const requestQueue = await RequestQueue.open(`${adapterName}-queue`);

		// 创建代理配置(如果可用)
		const proxyConfiguration =
			await this.proxyManager.createProxyConfiguration();

		// 构建爬虫参数对象
		const crawlerOptions = {
			requestList,
			requestQueue,
			maxConcurrency: this.settings.maxConcurrency,
			maxRequestsPerMinute: this.settings.maxRequestsPerMinute,
			maxRequestRetries: this.settings.maxRequestRetries,
			navigationTimeoutSecs: this.settings.navigationTimeoutSecs,
			launchContext: {
				launchOptions: {
					headless: true,
				},
			},
			async requestHandler({ page, request, crawler }) {
				try {
					await page.waitForTimeout(Math.floor(Math.random() * 3000) + 1000);
					const results = await adapter.handlePage({ page, request, crawler });
					if (Array.isArray(results)) {
						for (const result of results) {
							if (result.type === "news_link" && result.url) {
								await requestQueue.addRequest({ url: result.url });
							} else {
								await Dataset.pushData(result);
							}
						}
					}
					logger.info(`成功抓取: ${request.url}`);
				} catch (error) {
					logger.error(`抓取失败 ${request.url}: ${error.message}`);
					throw error;
				}
			},
			failedRequestHandler: async ({ request, error }) => {
				logger.error(`请求失败 ${request.url}: ${error.message}`);
				if (
					error.message.includes("proxy") ||
					error.message.includes("ECONNREFUSED") ||
					error.message.includes("timeout")
				) {
					this.proxyManager.markCurrentProxyInvalid();
				}
			},
		};

		// 只有在 proxyConfiguration 存在时才添加该参数
		if (proxyConfiguration) {
			crawlerOptions.proxyConfiguration = proxyConfiguration;
		}

		const crawler = new PlaywrightCrawler(crawlerOptions);
		return crawler;
	}

	/**
	 * 运行爬虫任务
	 * @param {string} adapterName - 适配器名称
	 * @param {Object} params - 爬取参数
	 * @returns {Promise<Array<Object>>} 爬取结果
	 */
	async run(adapterName, params = {}) {
		try {
			// 初始化代理池
			await this.proxyManager.initialize();

			// 准备请求列表
			const requestList = await this.prepareRequestList(adapterName, params);

			// 创建爬虫
			const crawler = await this.createCrawler(adapterName, requestList);

			// 启动爬虫并等待完成
			await crawler.run();

			// 获取并处理结果
			const dataset = await Dataset.open();
			const items = await dataset.getData();
			const adapter = this.getAdapter(adapterName);
			const processedResults = await adapter.processResults(items.items);

			logger.info(
				`爬虫任务完成, ${adapterName} 共获取 ${processedResults.length} 条数据`
			);

			return processedResults;
		} catch (error) {
			logger.error(`爬虫任务失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 运行组合爬虫任务
	 * @param {Object} tasks - 按适配器名称组织的任务参数
	 * @returns {Promise<Object>} 按适配器分组的结果
	 */
	async runMultiple(tasks = {}) {
		const results = {};

		for (const [adapterName, params] of Object.entries(tasks)) {
			try {
				results[adapterName] = await this.run(adapterName, params);
			} catch (error) {
				logger.error(`适配器 ${adapterName} 运行失败: ${error.message}`);
				results[adapterName] = { error: error.message };
			}
		}

		return results;
	}

	/**
	 * 将爬取结果保存到文件
	 * @param {Array<Object>} results - 爬取结果
	 * @param {string} filename - 文件名
	 * @returns {Promise<string>} 文件路径
	 */
	async saveResultsToFile(results, filename = `crawler-${Date.now()}`) {
		try {
			const filePath = path.join(process.cwd(), "data", `${filename}.json`);

			// 确保目录存在
			await fs.mkdir(path.dirname(filePath), { recursive: true });

			// 写入文件
			await fs.writeFile(filePath, JSON.stringify(results, null, 2), "utf8");
			logger.info(`爬取结果已保存到: ${filePath}`);

			return filePath;
		} catch (error) {
			logger.error(`保存结果错误: ${error.message}`);
			throw error;
		}
	}
}

// 导出单例实例
const crawlerService = new CrawlerService();
export default crawlerService;

// 导出类以便在需要时创建新实例
export { CrawlerService, SiteAdapter, WeiboAdapter, NewsAdapter, ProxyManager };
