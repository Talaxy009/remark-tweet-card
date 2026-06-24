/**
 * Twitter syndication API layer.
 * @module api
 */

import type { TweetData, FetchTweetDataOptions } from './types.js';

/** @internal */
const defaultCache = new Map<string, TweetData | null>();

const SYNDICATION_URL = 'https://cdn.syndication.twimg.com';

/**
 * Compute the token required by the Twitter syndication API.
 */
export function getToken(id: string): string {
	return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
}

/**
 * Validate and return a bare numeric tweet ID from raw input.
 * Accepts full URLs and extracts the final path segment.
 */
export function extractTweetId(input: string): string | null {
	const trimmed = input.trim();
	// Try extracting the last path segment from a URL
	if (trimmed.includes('/')) {
		const parts = trimmed.replace(/\/$/, '').split('/');
		const last = parts[parts.length - 1];
		if (/^\d+$/.test(last)) return last;
	}
	// Treat as bare ID
	return /^\d+$/.test(trimmed) ? trimmed : null;
}

/**
 * Fetch tweet data from the Twitter syndication API.
 * Results are cached in-memory unless a custom cache is provided.
 */
export async function fetchTweetData(
	id: string,
	opts: FetchTweetDataOptions = {},
): Promise<TweetData | null> {
	const { timeout = 10000, cache = defaultCache } = opts;

	if (cache.has(id)) return cache.get(id) ?? null;

	const token = getToken(id);
	const url = `${SYNDICATION_URL}/tweet-result?id=${id}&lang=en&token=${encodeURIComponent(token)}`;

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; RemarkTweetCard/1.0)',
			},
			signal: AbortSignal.timeout(timeout),
		});

		if (!response.ok) {
			cache.set(id, null);
			return null;
		}

		const data: TweetData = await response.json();

		// Syndication API may return an empty object for unavailable tweets
		if (!data || typeof data !== 'object' || !data.id_str) {
			cache.set(id, null);
			return null;
		}

		cache.set(id, data);
		return data;
	} catch {
		cache.set(id, null);
		return null;
	}
}

/**
 * Clear the default internal cache.
 * Has no effect if a custom cache was provided.
 */
export function clearCache(): void {
	defaultCache.clear();
}
