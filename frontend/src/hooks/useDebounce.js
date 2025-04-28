/**
 * @fileoverview 防抖自定义 Hook
 * 用于延迟处理快速变化的输入值，优化性能并减少不必要的 API 调用
 */

import { useState, useEffect, useRef } from "react";

/**
 * 防抖自定义 Hook
 * 对频繁变化的值（如搜索输入）进行防抖处理，减少不必要的渲染和 API 调用
 *
 * @param {any} value - 需要防抖处理的值
 * @param {number} delay - 防抖延迟时间（毫秒）
 * @param {Object} [options] - 配置选项
 * @param {boolean} [options.leading=false] - 是否在延迟开始前立即调用一次（前缘触发）
 * @param {boolean} [options.trailing=true] - 是否在延迟结束后调用（后缘触发）
 * @param {function} [options.onChange] - 当防抖值改变时的回调函数
 * @returns {any} 经过防抖处理后的值
 */
const useDebounce = (value, delay, options = {}) => {
	// 提取配置选项，设置默认值
	const { leading = false, trailing = true, onChange = null } = options;

	// 状态：当前防抖后的值
	const [debouncedValue, setDebouncedValue] = useState(value);

	// 引用：存储定时器 ID、前一个值和是否正在等待
	const timerRef = useRef(null);
	const previousValueRef = useRef(value);
	const isWaitingRef = useRef(false);

	useEffect(() => {
		// 如果值没有变化，则不执行防抖
		if (value === previousValueRef.current) {
			return;
		}

		// 更新前一个值的引用
		previousValueRef.current = value;

		// 如果启用前缘触发且当前不在等待中，则立即更新值
		if (leading && !isWaitingRef.current) {
			setDebouncedValue(value);
			isWaitingRef.current = true;

			// 如果有回调函数，则调用
			if (typeof onChange === "function") {
				onChange(value);
			}

			// 如果不启用后缘触发，则不需要设置定时器
			if (!trailing) {
				return;
			}
		}

		// 清除现有定时器
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		// 设置新的定时器
		timerRef.current = setTimeout(() => {
			// 如果启用后缘触发，则在定时器结束时更新值
			if (trailing) {
				setDebouncedValue(value);

				// 如果有回调函数，则调用
				if (typeof onChange === "function") {
					onChange(value);
				}
			}

			// 重置等待状态
			isWaitingRef.current = false;
			timerRef.current = null;
		}, delay);

		// 清理函数：组件卸载或依赖变化时清除定时器
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [value, delay, leading, trailing, onChange]);

	// 返回防抖后的值
	return debouncedValue;
};

export default useDebounce;

/**
 * useDebounceCallback - 防抖回调函数 Hook
 * 延迟执行回调函数，减少高频调用
 *
 * @param {function} callback - 需要防抖的回调函数
 * @param {number} delay - 防抖延迟时间（毫秒）
 * @param {Array} [dependencies=[]] - 依赖项数组，类似 useEffect 的依赖
 * @returns {function} 防抖处理后的回调函数
 */
export const useDebounceCallback = (callback, delay, dependencies = []) => {
	const callbackRef = useRef(callback);
	const timerRef = useRef(null);

	// 更新回调引用
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	// 使用 useCallback 记忆防抖函数
	const debouncedCallback = useCallback(
		(...args) => {
			// 清除之前的定时器
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}

			// 设置新的定时器
			timerRef.current = setTimeout(() => {
				callbackRef.current(...args);
			}, delay);
		},
		[delay, ...dependencies]
	);

	// 组件卸载时清除定时器
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	return debouncedCallback;
};

/**
 * useDebounceEffect - 防抖 Effect Hook
 * 延迟执行副作用，适用于防止频繁的副作用执行
 *
 * @param {function} effect - 需要执行的副作用函数
 * @param {number} delay - 防抖延迟时间（毫秒）
 * @param {Array} dependencies - 副作用的依赖项数组
 */
export const useDebounceEffect = (effect, delay, dependencies) => {
	const effectRef = useRef(effect);
	const timerRef = useRef(null);

	// 更新 effect 引用
	useEffect(() => {
		effectRef.current = effect;
	}, [effect]);

	// 监听依赖项变化并应用防抖
	useEffect(() => {
		// 清除之前的定时器
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		// 设置新的定时器
		timerRef.current = setTimeout(() => {
			effectRef.current();
		}, delay);

		// 清理函数
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [...dependencies, delay]);
};
