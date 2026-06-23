/**
 * remark-tweet-card — Remark plugin that transforms
 * `[$tweet](url)` paragraphs into embedded tweet cards.
 *
 * @module remark-tweet-card
 */

import { visit } from 'unist-util-visit';
import { extractTweetId, fetchTweetData } from './api.js';
import { buildTweetHTML, buildErrorHTML } from './html.js';

/**
 * @typedef {object} RemarkTweetCardOptions
 * @property {string} [prefix='tweet-card'] - CSS class prefix for all generated elements
 * @property {number} [timeout=10000] - fetch timeout in milliseconds
 * @property {Map<string, object|null>} [cache] - custom cache instance (must implement get/set/has)
 * @property {(id: string, options: { timeout: number }) => Promise<object|null>} [fetchTweet] - custom tweet data fetcher
 * @property {(tweet: object, options: { prefix: string }) => string} [renderTweet] - custom full tweet HTML renderer
 * @property {(url: string, options: { prefix: string, notFoundText?: string, viewOnXText?: string }) => string} [renderError] - custom error/fallback HTML renderer
 * @property {string} [notFoundText] - text shown when tweet is unavailable
 * @property {string} [viewOnXText] - link text for the fallback "View on X" link
 */

/**
 * Default plugin options.
 * @type {Required<Pick<RemarkTweetCardOptions, 'prefix'|'timeout'>>}
 */
const DEFAULT_OPTIONS = {
	prefix: 'tweet-card',
	timeout: 10000,
};

/**
 * Remark plugin entry point.
 * @param {RemarkTweetCardOptions} [opts]
 * @returns {(tree: object) => Promise<void>}
 */
export default function remarkTweetCard(opts) {
	const options = { ...DEFAULT_OPTIONS, ...opts };
	const { prefix, timeout, cache, notFoundText, viewOnXText } = options;

	/**
	 * @param {object} tree - mdast tree
	 * @returns {Promise<void>}
	 */
	return async function (tree) {
		/** @type {Array<{node: object, index: number, parent: object, url: string}>} */
		const targets = [];

		visit(tree, 'paragraph', (node, index, parent) => {
			if (node.children.length !== 1) return;
			const child = node.children[0];
			if (
				child.type === 'link' &&
				child.children.length === 1 &&
				child.children[0].type === 'text' &&
				child.children[0].value === '$tweet'
			) {
				targets.push({ node, index, parent, url: child.url });
			}
		});

		if (targets.length === 0) return;

		const results = await Promise.all(
			targets.map(async ({ url }) => {
				const id = extractTweetId(url);
				if (!id) return { tweet: null, url };

				const fetcher = options.fetchTweet || fetchTweetData;
				const tweet = await fetcher(id, { timeout, cache });
				const tweetUrl = `https://x.com/i/web/status/${id}`;
				return { tweet, url: tweetUrl };
			}),
		);

		for (let i = 0; i < targets.length; i++) {
			const { index, parent } = targets[i];
			const { tweet, url } = results[i];

			const renderTweet = options.renderTweet || buildTweetHTML;
			const renderError = options.renderError || buildErrorHTML;

			parent.children[index] = {
				type: 'html',
				value: tweet
					? renderTweet(tweet, { prefix })
					: renderError(url, { prefix, notFoundText, viewOnXText }),
			};
		}
	};
}
