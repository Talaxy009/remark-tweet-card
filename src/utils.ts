/**
 * Shared utility functions for remark-tweet-card.
 * @module utils
 */

/**
 * Sanitize a URL — only allow http/https protocols.
 */
export function sanitizeUrl(url: string): string {
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
 */
export function escapeAttr(str: unknown): string {
	return String(str ?? '')
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Format a numeric count with K/M abbreviations.
 */
export function formatCount(n?: number | null): string | null {
	if (n === undefined || n === null) return null;
	if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
	if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
	return String(n);
}

/**
 * Build a CSS class name with the configured prefix.
 */
export function className(prefix: string, suffix: string): string {
	return suffix ? `${prefix}-${suffix}` : prefix;
}
