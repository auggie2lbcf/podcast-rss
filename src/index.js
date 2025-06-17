// src/index.js

import { escapeXml } from './utils.js';

/**
 * @typedef {object} Podcast
 * @property {string} id - A unique identifier for the podcast (for podcast:guid).
 * @property {string} title
 * @property {string} description
 * @property {string} podcast_slug - The URL-friendly slug for the podcast.
 * @property {string} image_url
 * @property {string} [language='en-us']
 * @property {string|Date} created_at
 * @property {string|Date} [updated_at]
 * @property {string} owner - The author or host of the podcast.
 * @property {boolean} explicit
 * @property {string} itunes_owner_name
 * @property {string} itunes_owner_email
 * @property {'yes'|'no'} [locked='no']
 * @property {Array<{text: string, subtext?: string}>} itunes_category
 */

/**
 * @typedef {object} Episode
 * @property {string} guid - A unique, permanent identifier for the episode.
 * @property {string} title
 * @property {string} description
 * @property {string|Date} publication_date
 * @property {string} episode_slug - The URL-friendly slug for the episode.
 * @property {string} audio_url
 * @property {number} audio_length - File size in bytes.
 * @property {string} [image_url] - Episode-specific image URL.
 */

/**
 * @typedef {object} FeedOptions
 * @property {string} siteUrl - The base URL of your site (e.g., 'https://yourdomain.com').
 */

/**
 * Generates a podcast RSS feed XML string from provided data objects.
 *
 * @param {Podcast} podcast - The main podcast data object.
 * @param {Episode[]} episodes - An array of episode data objects.
 * @param {FeedOptions} options - Configuration options for the feed.
 * @returns {string} The complete RSS feed XML as a string.
 */
export function generatePodcastRss(podcast, episodes, options) {
  const { siteUrl } = options;

  // Construct URLs and dates
  const podcastBaseUrl = `${siteUrl}/podcasts/${podcast.podcast_slug}`;
  const podcastFeedUrl = `${podcastBaseUrl}/rss.xml`;
  const lastBuildDate = new Date(podcast.updated_at || podcast.created_at).toUTCString();

  // Build the XML string for the channel
  let rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:podcast="https://podcastindex.org/namespace/1.0" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <link>${podcastBaseUrl}</link>
    <description>${escapeXml(podcast.description)}</description>
    <language>${podcast.language || 'en-us'}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${lastBuildDate}</pubDate>
    <itunes:image href="${escapeXml(podcast.image_url)}"/>
    <itunes:author>${escapeXml(podcast.owner)}</itunes:author>
    <itunes:explicit>${podcast.explicit ? 'true' : 'false'}</itunes:explicit>
    <itunes:owner>
      <itunes:name>${escapeXml(podcast.itunes_owner_name)}</itunes:name>
      <itunes:email>${escapeXml(podcast.itunes_owner_email)}</itunes:email>
    </itunes:owner>
    ${podcast.itunes_category.map(cat =>
      cat.subtext
        ? `<itunes:category text="${escapeXml(cat.text)}"><itunes:category text="${escapeXml(cat.subtext)}"/></itunes:category>`
        : `<itunes:category text="${escapeXml(cat.text)}"/>`
    ).join('\n    ')}
    <atom:link href="${podcastFeedUrl}" rel="self" type="application/rss+xml"/>
    <podcast:locked>${podcast.locked || 'no'}</podcast:locked>
    <podcast:guid>${podcast.id}</podcast:guid>
`;

  // Add each episode as an <item>
  if (episodes) {
    for (const episode of episodes) {
      const episodeUrl = `${podcastBaseUrl}/episodes/${episode.episode_slug}`;
      const episodeImageUrl = episode.image_url || podcast.image_url;
      const enclosureType = episode.audio_url.includes('.mp4') || episode.audio_url.includes('.m4a') ? 'audio/mp4' : 'audio/mpeg';

      rssFeed += `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <guid isPermaLink="false">${episode.guid}</guid>
      <link>${episodeUrl}</link>
      <description>${escapeXml(episode.description)}</description>
      <pubDate>${new Date(episode.publication_date).toUTCString()}</pubDate>
      <enclosure url="${escapeXml(episode.audio_url)}" length="${episode.audio_length}" type="${enclosureType}"/>
      <itunes:author>${escapeXml(podcast.owner)}</itunes:author>
      <itunes:explicit>${podcast.explicit ? 'true' : 'false'}</itunes:explicit>
      <itunes:image href="${escapeXml(episodeImageUrl)}"/>
    </item>
`;
    }
  }

  // Close tags and return
  rssFeed += `
  </channel>
</rss>`;

  return rssFeed;
}