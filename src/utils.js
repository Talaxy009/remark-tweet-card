/**
 * Shared utility functions for remark-tweet-card.
 * @module utils
 */

/**
 * Sanitize a URL — only allow http/https protocols.
 * @param {string} url
 * @returns {string}
 */
export function sanitizeUrl(url) {
	if (typeof url !== 'string') return '#';
	try {
		const u = new URL(url);
		if (u.protocol === 'https:' || u.protocol === 'http:') return url;
		return '#';
	} catch {
		return '#';
	}
}

/**
 * Escape a value for safe use in an HTML attribute.
 * @param {unknown} str
 * @returns {string}
 */
export function escapeAttr(str) {
	return String(str ?? '')
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Format a numeric count with K/M abbreviations.
 * @param {number|undefined|null} n
 * @returns {string|null}
 */
export function formatCount(n) {
	if (n === undefined || n === null) return null;
	if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
	if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
	return String(n);
}

/**
 * Format a tweet creation date into a human-readable string.
 * @param {string} createdAt
 * @returns {string}
 */
export function formatDate(createdAt) {
	try {
		const d = new Date(createdAt);
		const time = d.toLocaleString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
			timeZone: 'UTC',
		});
		const date = d.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC',
		});
		return `${time} · ${date}`;
	} catch {
		return String(createdAt);
	}
}

/**
 * Build a CSS class name with the configured prefix.
 * @param {string} prefix
 * @param {string} suffix - may be empty for the root class
 * @returns {string}
 */
export function className(prefix, suffix) {
	return suffix ? `${prefix}-${suffix}` : prefix;
}
