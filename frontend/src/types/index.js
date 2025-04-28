/**
 * @fileoverview 类型定义导出文件
 * 这个文件将所有类型定义集中导出，方便在应用中统一引入
 */

// 导入 UI 类型定义
import ui, {
	UITheme,
	UILayout,
	NotificationType,
	FormState,
	ChartType,
	SidebarItemType,
	defaultUIState,
} from "./ui";

// 导入 API 类型定义
import api, { ErrorCodes, Endpoints } from "./api";

// 导出所有类型
export {
	// UI 类型
	UITheme,
	UILayout,
	NotificationType,
	FormState,
	ChartType,
	SidebarItemType,
	defaultUIState,

	// API 类型
	ErrorCodes,
	Endpoints,
};

// 默认导出所有类型的集合
export default {
	ui,
	api,
};
