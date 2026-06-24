/**
 * HTML builders for tweet card rendering.
 *
 * All functions accept a `prefix` parameter so that CSS class names
 * can be customized via plugin options.
 *
 * @module html
 */

import { sanitizeUrl, escapeAttr, formatCount, className } from './utils.js';
import { X_LOGO_SVG, VERIFIED_SVG, INFO_ICON_SVG } from './icons.js';
import type {
	TweetData,
	TweetMedia,
	TweetUrlEntity,
	TweetHashtagEntity,
	TweetMentionEntity,
	TextLabels,
	BuildTweetHTMLOptions,
	BuildErrorHTMLOptions,
	MediaSizeOverrides,
} from './types.js';

interface EntityItem {
	start: number;
	end: number;
	type: 'url' | 'hashtag' | 'mention';
	data: TweetUrlEntity | TweetHashtagEntity | TweetMentionEntity;
}

/**
 * Process tweet text entities (urls, hashtags, mentions) into HTML.
 * The syndication API returns text with HTML entities pre-encoded,
 * so text segments are used as-is.
 */
export function processBodyText(tweet: TweetData, prefix: string): string {
	const text = tweet.text || '';
	const [displayStart = 0, displayEnd = text.length] =
		tweet.display_text_range || [];
	const displayText = text.slice(displayStart, displayEnd);
	const entities = tweet.entities || {};

	const items: EntityItem[] = [];

	for (const url of entities.urls || []) {
		const s = url.indices[0] - displayStart;
		const e = url.indices[1] - displayStart;
		if (s >= 0 && e <= displayText.length) {
			items.push({ start: s, end: e, type: 'url', data: url });
		}
	}

	for (const tag of entities.hashtags || []) {
		const s = tag.indices[0] - displayStart;
		const e = tag.indices[1] - displayStart;
		if (s >= 0 && e <= displayText.length) {
			items.push({ start: s, end: e, type: 'hashtag', data: tag });
		}
	}

	for (const mention of entities.user_mentions || []) {
		const s = mention.indices[0] - displayStart;
		const e = mention.indices[1] - displayStart;
		if (s >= 0 && e <= displayText.length) {
			items.push({ start: s, end: e, type: 'mention', data: mention });
		}
	}

	items.sort((a, b) => a.start - b.start);

	let html = '';
	let cursor = 0;

	for (const item of items) {
		if (item.start < cursor) continue;

		html += displayText.slice(cursor, item.start);

		switch (item.type) {
			case 'url': {
				const urlData = item.data as TweetUrlEntity;
				const href = escapeAttr(
					sanitizeUrl(urlData.expanded_url || urlData.url),
				);
				const display = escapeAttr(urlData.display_url || urlData.url);
				html += `<a href="${href}" target="_blank" rel="noopener noreferrer" class="${className(prefix, 'link')}">${display}</a>`;
				break;
			}
			case 'hashtag': {
				const tagData = item.data as TweetHashtagEntity;
				const tag = encodeURIComponent(tagData.text);
				html += `<a href="https://x.com/hashtag/${tag}" target="_blank" rel="noopener noreferrer" class="${className(prefix, 'link')}">#${tagData.text}</a>`;
				break;
			}
			case 'mention': {
				const mentionData = item.data as TweetMentionEntity;
				const sn = encodeURIComponent(mentionData.screen_name);
				html += `<a href="https://x.com/${sn}" target="_blank" rel="noopener noreferrer" class="${className(prefix, 'link')}">@${mentionData.screen_name}</a>`;
				break;
			}
		}

		cursor = item.end;
	}

	html += displayText.slice(cursor);
	return html;
}

/**
 * Build HTML for a media block (photos / videos).
 * Shared by the main tweet and quoted tweet.
 */
export function buildMediaBlockHTML(
	mediaDetails: TweetMedia[] | undefined,
	prefix: string,
	containerSuffix?: string,
	_sizeOverrides?: MediaSizeOverrides,
): string {
	const media = mediaDetails || [];
	if (!media.length) return '';

	const containerClass = containerSuffix
		? className(prefix, containerSuffix)
		: className(prefix, 'media');

	const videos = media.filter(
		(m) => m.type === 'video' || m.type === 'animated_gif',
	);
	const photos = media.filter((m) => m.type === 'photo');

	if (videos.length > 0) {
		const thumb = escapeAttr(videos[0].media_url_https);
		return `<div class="${containerClass}"><div class="${className(prefix, 'media-video')}"><img class="${className(prefix, 'media-img')}" src="${thumb}" alt="Video" loading="lazy" /><div class="${className(prefix, 'media-play')}">▶</div></div></div>`;
	}

	if (photos.length === 0) return '';

	if (photos.length === 1) {
		const src = escapeAttr(
			`${photos[0].media_url_https}?format=jpg&name=small`,
		);
		return `<div class="${containerClass}"><div class="${className(prefix, 'media-single')}"><img class="${className(prefix, 'media-img')}" src="${src}" alt="Tweet image" loading="lazy" /></div></div>`;
	}

	const count = Math.min(photos.length, 4);
	const imgs = photos
		.slice(0, count)
		.map((p) => {
			const src = escapeAttr(
				`${p.media_url_https}?format=jpg&name=small`,
			);
			return `<img class="${className(prefix, 'media-img')}" src="${src}" alt="Tweet image" loading="lazy" />`;
		})
		.join('');

	return `<div class="${containerClass}"><div class="${className(prefix, 'media-grid')} ${className(prefix, `media-grid-${count}`)}">${imgs}</div></div>`;
}

/**
 * Build HTML for a quoted tweet.
 */
export function buildQuotedTweetHTML(qt: TweetData, prefix: string): string {
	if (!qt?.user) return '';

	const qtUrl = escapeAttr(
		`https://x.com/${qt.user.screen_name}/status/${qt.id_str}`,
	);
	const qtAvatar = escapeAttr(qt.user.profile_image_url_https || '');
	const qtName = escapeAttr(qt.user.name);
	const qtHandle = qt.user.screen_name;
	const qtText = qt.text
		? qt.text.slice(
				...((qt.display_text_range || [0, qt.text.length]) as [
					number,
					number,
				]),
			)
		: '';

	const qtMediaHtml = buildMediaBlockHTML(
		qt.mediaDetails,
		prefix,
		'quoted-media-wrap',
	);

	return `<a href="${qtUrl}" target="_blank" rel="noopener noreferrer" class="${className(prefix, 'quoted')}"><div class="${className(prefix, 'quoted-header')}"><img src="${qtAvatar}" alt="${qtName}" class="${className(prefix, 'quoted-avatar')}" loading="lazy" /><span class="${className(prefix, 'quoted-author-name')}">${qtName}</span><span class="${className(prefix, 'quoted-author-handle')}">@${qtHandle}</span></div><p class="${className(prefix, 'quoted-body')}">${qtText}</p>${qtMediaHtml}</a>`;
}

/**
 * Build the full tweet card HTML.
 */
export function buildTweetHTML(
	tweet: TweetData,
	{ prefix, text }: BuildTweetHTMLOptions,
): string {
	const tweetUrl = `https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
	const avatarUrl = escapeAttr(
		(tweet.user.profile_image_url_https || '').replace(
			'_normal',
			'_200x200',
		),
	);
	const verified = tweet.user.is_blue_verified || tweet.user.verified;
	const name = escapeAttr(tweet.user.name);
	const screenName = tweet.user.screen_name;

	const bodyHtml = processBodyText(tweet, prefix);
	const mediaHtml = buildMediaBlockHTML(tweet.mediaDetails, prefix);
	const quotedHtml = tweet.quoted_tweet
		? buildQuotedTweetHTML(tweet.quoted_tweet, prefix)
		: '';

	const replyToHtml = tweet.in_reply_to_screen_name
		? `<div class="${className(prefix, 'reply')}">Replying to <a href="https://x.com/${encodeURIComponent(tweet.in_reply_to_screen_name)}" target="_blank" rel="noopener noreferrer" class="${className(prefix, 'link')}">@${tweet.in_reply_to_screen_name}</a></div>`
		: '';

	const createdAt = tweet.created_at;
	const timeId = `twt-${tweet.id_str}`;
	const safeTweetUrl = escapeAttr(sanitizeUrl(tweetUrl));

	const likeCount = formatCount(tweet.favorite_count);
	const retweetCount = formatCount(tweet.retweet_count);
	const replyCount = formatCount(tweet.conversation_count);
	const quoteCount = formatCount(tweet.quote_count);

	const statsHtml = [
		replyCount !== null
			? `<span class="${className(prefix, 'action-stat')}"><span class="${className(prefix, 'stat-count')}">${replyCount}</span> ${text.replies}</span>`
			: '',
		retweetCount !== null
			? `<span class="${className(prefix, 'action-stat')}"><span class="${className(prefix, 'stat-count')}">${retweetCount}</span> ${text.reposts}</span>`
			: '',
		quoteCount !== null
			? `<span class="${className(prefix, 'action-stat')}"><span class="${className(prefix, 'stat-count')}">${quoteCount}</span> ${text.quotes}</span>`
			: '',
		likeCount !== null
			? `<span class="${className(prefix, 'action-stat')}"><span class="${className(prefix, 'stat-count')}">${likeCount}</span> ${text.likes}</span>`
			: '',
	]
		.filter(Boolean)
		.join('');

	const viewOnX = text.viewOnX;

	return (
		`<div class="${className(prefix, '')}">` +
		`<article class="${className(prefix, 'article')}"><div class="${className(prefix, 'header')}"><a href="https://x.com/${encodeURIComponent(screenName)}" target="_blank" rel="noopener noreferrer" class="${className(prefix, 'avatar-link')}"><img src="${avatarUrl}" alt="${name}" class="${className(prefix, 'avatar')}" loading="lazy" /></a><div class="${className(prefix, 'author')}"><div class="${className(prefix, 'author-row')}"><span class="${className(prefix, 'author-name')}">${name}</span>${verified ? VERIFIED_SVG : ''}</div><div class="${className(prefix, 'author-handle')}">@${screenName}</div></div><a href="${safeTweetUrl}" target="_blank" rel="noopener noreferrer" class="${className(prefix, 'x-link')}" aria-label="${viewOnX}">${X_LOGO_SVG}</a></div>${replyToHtml}<p class="${className(prefix, 'body')}">${bodyHtml}</p>${mediaHtml}${quotedHtml}<div class="${className(prefix, 'info')}"><a href="${safeTweetUrl}" target="_blank" rel="noopener noreferrer" class="${className(prefix, 'date')}"><time id="${timeId}"></time></a><a href="https://help.x.com/en/x-for-websites-ads-info-and-privacy" target="_blank" rel="noopener noreferrer" class="${className(prefix, 'privacy-link')}" aria-label="X for Websites: Ads info and privacy">${INFO_ICON_SVG}</a></div><div class="${className(prefix, 'actions')}">${statsHtml}<a href="${safeTweetUrl}" target="_blank" rel="noopener noreferrer" class="${className(prefix, 'view-btn')}">${viewOnX}</a></div></article>` +
		`<script>(function(){var t=document.getElementById('${timeId}');if(!t)return;var d=new Date('${createdAt}');if(isNaN(d.getTime()))return;t.textContent=d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit',hour12:true})+' \xb7 '+d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})})()</script>` +
		`</div>`
	).trim();
}

/**
 * Build a fallback HTML element when the tweet cannot be fetched.
 */
export function buildErrorHTML(
	originalUrl: string,
	{ prefix, text }: BuildErrorHTMLOptions,
): string {
	const safeUrl = escapeAttr(sanitizeUrl(originalUrl));
	const notFound = escapeAttr(text.notFound);
	const viewX = escapeAttr(text.viewOnX);
	return `<div class="${className(prefix, '')}"><article class="${className(prefix, 'article')} ${className(prefix, 'not-found')}"><p class="${className(prefix, 'not-found-text')}">${notFound}</p><a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="${className(prefix, 'link')}">${viewX}</a></article></div>`.trim();
}
