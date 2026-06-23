/**
 * TypeScript declarations for remark-tweet-card.
 */

declare module 'remark-tweet-card' {
	import type { Root } from 'mdast';

	/**
	 * Options for the remark-tweet-card plugin.
	 */
	export interface RemarkTweetCardOptions {
		/**
		 * CSS class prefix for all generated elements.
		 * @default 'tweet-card'
		 */
		prefix?: string;

		/**
		 * Fetch timeout in milliseconds.
		 * @default 10000
		 */
		timeout?: number;

		/**
		 * Custom cache instance (must implement get/set/has).
		 * @default internal Map
		 */
		cache?: Map<string, object | null>;

		/**
		 * Custom tweet data fetcher. Receives the tweet ID and options,
		 * should return tweet data or null.
		 */
		fetchTweet?: (
			id: string,
			options: { timeout: number; cache?: Map<string, object | null> },
		) => Promise<object | null>;

		/**
		 * Custom tweet card HTML renderer. Receives the tweet data
		 * and options, should return an HTML string.
		 */
		renderTweet?: (
			tweet: object,
			options: { prefix: string },
		) => string;

		/**
		 * Custom error/fallback HTML renderer.
		 */
		renderError?: (
			url: string,
			options: {
				prefix: string;
				notFoundText?: string;
				viewOnXText?: string;
			},
		) => string;

		/**
		 * Text shown when a tweet is unavailable.
		 * @default 'Tweet not available.'
		 */
		notFoundText?: string;

		/**
		 * Link text for the fallback "View on X" link.
		 * @default 'View on X →'
		 */
		viewOnXText?: string;
	}

	/**
	 * Remark plugin that transforms `[$tweet](url)` paragraphs
	 * into embedded tweet cards.
	 *
	 * @param options - plugin options
	 * @returns a unified transformer function
	 */
	function remarkTweetCard(
		options?: RemarkTweetCardOptions,
	): (tree: Root) => Promise<void>;

	export default remarkTweetCard;
}

declare module 'remark-tweet-card/api' {
	export function getToken(id: string): string;
	export function extractTweetId(input: string): string | null;
	export function fetchTweetData(
		id: string,
		opts?: {
			timeout?: number;
			cache?: Map<string, object | null>;
		},
	): Promise<object | null>;
	export function clearCache(): void;
}

declare module 'remark-tweet-card/html' {
	export function processBodyText(
		tweet: object,
		prefix: string,
	): string;
	export function buildMediaBlockHTML(
		mediaDetails: any[] | undefined,
		prefix: string,
		containerSuffix?: string,
		sizeOverrides?: {
			singleH?: number;
			gridH?: number;
			grid3FirstH?: number;
			videoH?: number;
		},
	): string;
	export function buildQuotedTweetHTML(
		qt: object,
		prefix: string,
	): string;
	export function buildTweetHTML(
		tweet: object,
		opts: { prefix: string },
	): string;
	export function buildErrorHTML(
		originalUrl: string,
		opts: {
			prefix: string;
			notFoundText?: string;
			viewOnXText?: string;
		},
	): string;
}

declare module 'remark-tweet-card/utils' {
	export function sanitizeUrl(url: string): string;
	export function escapeAttr(str: unknown): string;
	export function formatCount(n?: number | null): string | null;
	export function formatDate(createdAt: string): string;
	export function className(prefix: string, suffix: string): string;
}

declare module 'remark-tweet-card/icons' {
	export const X_LOGO_SVG: string;
	export const VERIFIED_SVG: string;
	export const INFO_ICON_SVG: string;
}
