/**
 * Twitter syndication API layer.
 * @module api
 */

/** @type {Map<string, object|null>} */
const defaultCache = new Map();

const SYNDICATION_URL = 'https://cdn.syndication.twimg.com';

/**
 * Compute the token required by the Twitter syndication API.
 * @param {string} id - numeric tweet ID
 * @returns {string}
 */
export function getToken(id) {
	return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
}

/**
 * Validate and return a bare numeric tweet ID from raw input.
 * Accepts full URLs and extracts the final path segment.
 * @param {string} input - tweet URL or raw ID
 * @returns {string|null}
 */
export function extractTweetId(input) {
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
 *
 * @param {string} id - numeric tweet ID
 * @param {object} [opts]
 * @param {number} [opts.timeout=10000] - fetch timeout in ms
 * @param {Map<string, object|null>} [opts.cache] - custom cache instance
 * @returns {Promise<object|null>}
 */
export async function fetchTweetData(id, opts = {}) {
	const { timeout = 10000, cache = defaultCache } = opts;

	if (cache.has(id)) return cache.get(id);

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

		const data = await response.json();

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
export function clearCache() {
	defaultCache.clear();
}
