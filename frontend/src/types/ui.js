/**
 * @fileoverview UI 相关类型定义
 * 使用 JSDoc 为 JavaScript 提供类似 TypeScript 的类型支持
 */

/**
 * 主题模式
 * @readonly
 * @enum {string}
 */
export const UITheme = {
	/** 浅色主题 */
	LIGHT: "light",
	/** 深色主题 */
	DARK: "dark",
	/** 跟随系统 */
	SYSTEM: "system",
};

/**
 * 布局模式
 * @readonly
 * @enum {string}
 */
export const UILayout = {
	/** 默认布局 */
	DEFAULT: "default",
	/** 紧凑布局 */
	COMPACT: "compact",
	/** 扩展布局 */
	EXPANDED: "expanded",
};

/**
 * 通知类型
 * @readonly
 * @enum {string}
 */
export const NotificationType = {
	/** 信息通知 */
	INFO: "info",
	/** 成功通知 */
	SUCCESS: "success",
	/** 警告通知 */
	WARNING: "warning",
	/** 错误通知 */
	ERROR: "error",
};

/**
 * 表单状态
 * @readonly
 * @enum {string}
 */
export const FormState = {
	/** 初始状态 */
	IDLE: "idle",
	/** 提交中 */
	SUBMITTING: "submitting",
	/** 提交成功 */
	SUCCESS: "success",
	/** 提交失败 */
	ERROR: "error",
};

/**
 * 图表类型
 * @readonly
 * @enum {string}
 */
export const ChartType = {
	/** 折线图 */
	LINE: "line",
	/** 柱状图 */
	BAR: "bar",
	/** 饼图 */
	PIE: "pie",
	/** 雷达图 */
	RADAR: "radar",
	/** 散点图 */
	SCATTER: "scatter",
	/** 热力图 */
	HEATMAP: "heatmap",
	/** 词云图 */
	WORDCLOUD: "wordcloud",
};

/**
 * 侧边栏项目类型
 * @readonly
 * @enum {string}
 */
export const SidebarItemType = {
	/** 导航链接 */
	LINK: "link",
	/** 下拉菜单 */
	DROPDOWN: "dropdown",
	/** 分隔线 */
	DIVIDER: "divider",
	/** 分组标题 */
	HEADER: "header",
};

/**
 * @typedef {Object} Notification
 * @property {string} id - 通知唯一标识
 * @property {string} message - 通知消息内容
 * @property {string} type - 通知类型，参见 NotificationType
 * @property {Date} timestamp - 通知创建时间
 * @property {boolean} [read=false] - 是否已读
 * @property {number} [duration=5000] - 通知显示时长（毫秒），0 表示不自动关闭
 * @property {Object} [action] - 可选的通知操作
 * @property {string} [action.label] - 操作按钮文本
 * @property {Function} [action.onClick] - 操作回调函数
 */

/**
 * @typedef {Object} SidebarItem
 * @property {string} id - 项目唯一标识
 * @property {string} label - 显示名称
 * @property {string} type - 项目类型，参见 SidebarItemType
 * @property {string} [icon] - 图标名称
 * @property {string} [path] - 链接路径（仅 LINK 类型）
 * @property {Array<SidebarItem>} [children] - 子项目（仅 DROPDOWN 类型）
 * @property {boolean} [expanded=false] - 是否展开（仅 DROPDOWN 类型）
 * @property {boolean} [active=false] - 是否激活
 * @property {Function} [onClick] - 点击回调函数
 */

/**
 * @typedef {Object} UIState
 * @property {boolean} isLoading - 全局加载状态
 * @property {boolean} isSidebarOpen - 侧边栏是否打开
 * @property {string} theme - 当前主题，参见 UITheme
 * @property {string} layout - 当前布局，参见 UILayout
 * @property {Array<Notification>} notifications - 通知列表
 * @property {Object} modals - 模态框状态
 * @property {boolean} modals.isLoginOpen - 登录模态框是否打开
 * @property {boolean} modals.isRegisterOpen - 注册模态框是否打开
 * @property {boolean} modals.isTaskFormOpen - 任务表单模态框是否打开
 * @property {boolean} modals.isConfirmOpen - 确认模态框是否打开
 * @property {Object} confirmDialog - 确认对话框配置
 * @property {string} confirmDialog.title - 对话框标题
 * @property {string} confirmDialog.message - 对话框消息
 * @property {Function} confirmDialog.onConfirm - 确认回调
 * @property {Function} confirmDialog.onCancel - 取消回调
 */

/**
 * @typedef {Object} Tab
 * @property {string} id - 选项卡唯一标识
 * @property {string} label - 显示名称
 * @property {string} [icon] - 图标名称
 * @property {boolean} [disabled=false] - 是否禁用
 * @property {boolean} [active=false] - 是否激活
 * @property {React.ReactNode} content - 选项卡内容
 */

/**
 * @typedef {Object} Breadcrumb
 * @property {string} label - 显示名称
 * @property {string} [path] - 链接路径，如果不提供则为纯文本显示
 * @property {string} [icon] - 图标名称
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} id - 菜单项唯一标识
 * @property {string} label - 显示名称
 * @property {string} [icon] - 图标名称
 * @property {Function} [onClick] - 点击回调函数
 * @property {boolean} [disabled=false] - 是否禁用
 * @property {Array<MenuItem>} [children] - 子菜单项
 * @property {boolean} [divider=false] - 是否在此项后添加分隔线
 */

/**
 * @typedef {Object} FilterOption
 * @property {string} id - 选项唯一标识
 * @property {string} label - 显示名称
 * @property {any} value - 选项值
 * @property {boolean} [selected=false] - 是否选中
 * @property {boolean} [disabled=false] - 是否禁用
 */

/**
 * @typedef {Object} ChartConfig
 * @property {string} type - 图表类型，参见 ChartType
 * @property {Array<Object>} data - 图表数据
 * @property {Object} options - 图表配置选项
 * @property {string} [title] - 图表标题
 * @property {Object} [dimensions] - 图表尺寸
 * @property {number} [dimensions.width] - 宽度
 * @property {number} [dimensions.height] - 高度
 * @property {Object} [responsive] - 响应式配置
 */

/**
 * 默认 UI 状态
 */
export const defaultUIState = {
	isLoading: false,
	isSidebarOpen: true,
	theme: UITheme.SYSTEM,
	layout: UILayout.DEFAULT,
	notifications: [],
	modals: {
		isLoginOpen: false,
		isRegisterOpen: false,
		isTaskFormOpen: false,
		isConfirmOpen: false,
	},
	confirmDialog: {
		title: "",
		message: "",
		onConfirm: () => {},
		onCancel: () => {},
	},
};

export default {
	UITheme,
	UILayout,
	NotificationType,
	FormState,
	ChartType,
	SidebarItemType,
	defaultUIState,
};
