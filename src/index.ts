/**
 * remark-tweet-card — Remark plugin that transforms
 * `[$tweet](url)` paragraphs into embedded tweet cards.
 *
 * @module remark-tweet-card
 */

import { visit } from 'unist-util-visit';
import { extractTweetId, fetchTweetData } from './api.js';
import { buildTweetHTML, buildErrorHTML } from './html.js';
import type { TweetData, TextLabels, RemarkTweetCardOptions } from './types.js';

/**
 * Default plugin options.
 */
const DEFAULT_OPTIONS: Required<
	Pick<RemarkTweetCardOptions, 'prefix' | 'timeout'>
> = {
	prefix: 'tweet-card',
	timeout: 10000,
};

const DEFAULT_TEXT: TextLabels = {
	replies: 'Replies',
	reposts: 'Reposts',
	quotes: 'Quotes',
	likes: 'Likes',
	viewOnX: 'View on X',
	notFound: 'Tweet not available.',
};

/** mdast node types used internally */
interface MdastNode {
	type: string;
	children?: MdastNode[];
	value?: string;
	url?: string;
}

interface MdastParent extends MdastNode {
	children: MdastNode[];
}

interface MdastRoot extends MdastParent {
	type: 'root';
}

/**
 * Remark plugin entry point.
 */
export default function remarkTweetCard(
	opts?: RemarkTweetCardOptions,
): (tree: MdastRoot) => Promise<void> {
	const options = {
		...DEFAULT_OPTIONS,
		...opts,
		text: { ...DEFAULT_TEXT, ...(opts?.text || {}) } as TextLabels,
	};
	const { prefix, timeout, cache, text } = options;

	return async function (tree: MdastRoot): Promise<void> {
		const targets: Array<{
			node: MdastNode;
			index: number;
			parent: MdastParent;
			url: string;
		}> = [];

		visit(tree, 'paragraph', (node, index, parent) => {
			if (!node || !('children' in node)) return;
			const paraNode = node as MdastNode;
			if (!paraNode.children || paraNode.children.length !== 1) return;
			const child = paraNode.children[0];
			if (
				child.type === 'link' &&
				child.children &&
				child.children.length === 1 &&
				child.children[0].type === 'text' &&
				child.children[0].value === '$tweet'
			) {
				targets.push({
					node: paraNode,
					index: index!,
					parent: parent as unknown as MdastParent,
					url: child.url!,
				});
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
					? renderTweet(tweet, { prefix, text })
					: renderError(url, { prefix, text }),
			};
		}
	};
}
