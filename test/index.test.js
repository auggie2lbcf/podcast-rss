import { generatePodcastRss } from '../src/index.js';

// --- Mock Data for Tests ---

const mockPodcastData = {
  title: 'Test & Tune Podcast',
  description: 'A show about code & other things.',
  image_url: 'https://example.com/cover.png',
  podcast_slug: 'test-and-tune',
  owner: 'Dev Team',
  itunes_owner_name: 'Dev Team',
  itunes_owner_email: 'dev@example.com',
  itunes_category: [{ text: 'Technology' }],
  id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  created_at: '2025-06-17T14:30:00.000Z',
  explicit: false,
};

const mockEpisodes = [
  {
    guid: 'episode-guid-1',
    title: 'Episode 1: The First Test',
    description: 'This is the show notes for episode one.',
    publication_date: '2025-06-17T14:30:00.000Z',
    audio_url: 'https://example.com/ep1.mp3',
    audio_length: 12345678,
    episode_slug: 'the-first-test',
  },
  {
    guid: 'episode-guid-2',
    title: 'Episode 2: XML Escaping & Special Characters',
    description: 'A description with characters that need escaping: < > & " \' ',
    publication_date: '2025-06-10T14:30:00.000Z',
    audio_url: 'https://example.com/ep2.mp3?query=param&another=value',
    audio_length: 87654321,
    episode_slug: 'xml-escaping',
  },
];

const mockFeedOptions = {
  siteUrl: 'https://www.my-test-site.com',
};


// --- Test Suite ---

describe('generatePodcastRss', () => {

  test('should generate a valid RSS feed with all required elements', () => {
    const feed = generatePodcastRss(mockPodcastData, mockEpisodes, mockFeedOptions);

    // Basic checks
    expect(feed).toBeDefined();
    expect(typeof feed).toBe('string');
    expect(feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);

    // Channel-level checks
    expect(feed).toContain('<rss');
    expect(feed).toContain('<channel>');

    // --- CORRECTED LINES ---
    expect(feed).toContain(`<title>Test &amp; Tune Podcast</title>`);
    expect(feed).toContain(`<description>A show about code &amp; other things.</description>`);
    // ----------------------

    expect(feed).toContain(`<link>${mockFeedOptions.siteUrl}/podcasts/${mockPodcastData.podcast_slug}</link>`);
    expect(feed).toContain('<itunes:owner>');
    expect(feed).toContain(`<itunes:name>${mockPodcastData.itunes_owner_name}</itunes:name>`);
    expect(feed).toContain(`<itunes:email>${mockPodcastData.itunes_owner_email}</itunes:email>`);
    expect(feed).toContain('</itunes:owner>');
    expect(feed).toContain('</channel>');
    expect(feed).toContain('</rss>');

    // Item-level checks (for the first episode)
    expect(feed).toContain('<item>');
    expect(feed).toContain(`<title>${mockEpisodes[0].title}</title>`);
    expect(feed).toContain(`<guid isPermaLink="false">${mockEpisodes[0].guid}</guid>`);
    expect(feed).toContain(`<pubDate>${new Date(mockEpisodes[0].publication_date).toUTCString()}</pubDate>`);
    expect(feed).toContain(`<enclosure url="${mockEpisodes[0].audio_url}" length="${mockEpisodes[0].audio_length}"`);
    expect(feed).toContain('</item>');
  });

  test('should correctly escape special XML characters', () => {
    const episodeWithSpecialChars = mockEpisodes[1];
    const feed = generatePodcastRss(mockPodcastData, [episodeWithSpecialChars], mockFeedOptions);

    // Check escaped description
    const expectedEscapedDescription = 'A description with characters that need escaping: &lt; &gt; &amp; &quot; &apos; ';
    expect(feed).toContain(`<description>${expectedEscapedDescription}</description>`);

    // Check escaped enclosure URL
    const expectedEscapedUrl = 'https://example.com/ep2.mp3?query=param&amp;another=value';
    expect(feed).toContain(`<enclosure url="${expectedEscapedUrl}"`);
  });

  test('should handle an empty episodes array gracefully', () => {
    const feed = generatePodcastRss(mockPodcastData, [], mockFeedOptions);

    // Should still be a valid feed structure
    expect(feed).toContain('<channel>');
    expect(feed).toContain(`</channel>`);

    // Should NOT contain any <item> tags
    expect(feed).not.toContain('<item>');
  });

  test('should generate the correct number of item blocks', () => {
    const feed = generatePodcastRss(mockPodcastData, mockEpisodes, mockFeedOptions);

    // Use a regular expression to count occurrences of '<item>'
    const itemMatches = feed.match(/<item>/g);
    expect(itemMatches).not.toBeNull();
    expect(itemMatches.length).toBe(mockEpisodes.length);
  });
});