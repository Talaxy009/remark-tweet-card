/**
 * Shared type definitions for remark-tweet-card.
 * @module types
 */

// ── Twitter Syndication API shapes ──────────────────────

export interface TweetUser {
	id_str: string;
	screen_name: string;
	name: string;
	profile_image_url_https: string;
	is_blue_verified?: boolean;
	verified?: boolean;
}

export interface TweetMedia {
	type: 'photo' | 'video' | 'animated_gif';
	media_url_https: string;
}

export interface TweetUrlEntity {
	indices: [number, number];
	url: string;
	expanded_url?: string;
	display_url?: string;
}

export interface TweetHashtagEntity {
	indices: [number, number];
	text: string;
}

export interface TweetMentionEntity {
	indices: [number, number];
	screen_name: string;
}

export interface TweetEntities {
	urls?: TweetUrlEntity[];
	hashtags?: TweetHashtagEntity[];
	user_mentions?: TweetMentionEntity[];
}

export interface TweetData {
	id_str: string;
	text?: string;
	display_text_range?: [number, number];
	created_at: string;
	user: TweetUser;
	entities?: TweetEntities;
	mediaDetails?: TweetMedia[];
	quoted_tweet?: TweetData;
	in_reply_to_screen_name?: string;
	favorite_count?: number;
	retweet_count?: number;
	conversation_count?: number;
	quote_count?: number;
}

export interface FetchTweetDataOptions {
	timeout?: number;
	cache?: Map<string, TweetData | null>;
}

// ── HTML rendering ──────────────────────────────────────

export interface TextLabels {
	/** Label for reply count */
	replies: string;
	/** Label for repost count */
	reposts: string;
	/** Label for quote count */
	quotes: string;
	/** Label for like count */
	likes: string;
	/** Text for the "View on X" button */
	viewOnX: string;
	/** Text shown when tweet is unavailable */
	notFound: string;
}

export interface BuildTweetHTMLOptions {
	prefix: string;
	text: TextLabels;
}

export interface BuildErrorHTMLOptions {
	prefix: string;
	text: TextLabels;
}

export interface MediaSizeOverrides {
	singleH?: number;
	gridH?: number;
	grid3FirstH?: number;
	videoH?: number;
}

// ── Plugin options ──────────────────────────────────────

export interface RemarkTweetCardOptions {
	/** CSS class prefix for all generated elements @default 'tweet-card' */
	prefix?: string;
	/** fetch timeout in milliseconds @default 10000 */
	timeout?: number;
	/** custom cache instance (must implement get/set/has) */
	cache?: Map<string, TweetData | null>;
	/** custom tweet data fetcher */
	fetchTweet?: (
		id: string,
		options: { timeout: number; cache?: Map<string, TweetData | null> },
	) => Promise<TweetData | null>;
	/** custom full tweet HTML renderer */
	renderTweet?: (
		tweet: TweetData,
		options: { prefix: string; text: TextLabels },
	) => string;
	/** custom error/fallback HTML renderer */
	renderError?: (
		url: string,
		options: { prefix: string; text: TextLabels },
	) => string;
	/** localized text labels */
	text?: Partial<TextLabels>;
}
