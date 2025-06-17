# Podcast RSS Generator

A simple, data-agnostic JavaScript utility to generate a valid podcast RSS 2.0 feed from your own data objects.

### Core Concept: Server vs. Browser

This package is a JavaScript utility that can run anywhere. However, a real podcast feed **must** be a publicly accessible file on a **server**. Podcast platforms like Spotify and Apple Podcasts need a static URL to check for new episodes.

This means the correct way to use this library is in a **server-side environment** like a **Next.js API Route** or an **Express** backend.

We have also included a **Pure React example for demonstration purposes**, showing how the library can be run in the browser to view or download the feed manually.

## Installation

```bash
npm install podcast-rss
```

## How It Works

The package exports a single function, `generatePodcastRss`. You provide it with your show's data, and it returns the complete XML feed as a string.

```javascript
import { generatePodcastRss } from 'podcast-rss-generator-js';

const feed = generatePodcastRss(podcast, episodes, options);
```

---

## API Reference: Complete List of Options

### `Podcast` Object Options

This object contains all the channel-level information for your podcast.

| Key | Type | Required? | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Required** | The name of your podcast. |
| `description`| `string` | **Required** | A short description or summary of the show. |
| `image_url` | `string` | **Required** | URL to the podcast's square cover art (JPG/PNG, 1400x1400 to 3000x3000 pixels). |
| `podcast_slug`| `string` | **Required** | The URL-friendly slug used to build the feed's link. |
| `owner` | `string` | **Required** | The author or host of the podcast. Used for `<itunes:author>`. |
| `itunes_owner_name`|`string`| **Required** | The name of the podcast owner. Displayed in podcast clients. |
| `itunes_owner_email`|`string`| **Required** | The email of the podcast owner. Used for verification. |
| `itunes_category`|`Array<object>`| **Required**| An array of category objects. Ex: `[{ text: 'Technology' }]` or `[{ text: 'Business', subtext: 'Careers' }]`. |
| `id` | `string` | **Required** | A unique identifier for the podcast itself. Used for `<podcast:guid>`. A UUID is recommended. |
| `created_at`| `Date` or `string`| **Required**| The date the podcast was created. Used for `<pubDate>`. |
| `explicit` | `boolean` | **Required** | `true` if the podcast contains explicit content, otherwise `false`. |
| `language` | `string` | Optional | The two-letter ISO language code (e.g., `en`, `es`). Defaults to `en-us`. |
| `updated_at`| `Date` or `string`| Optional | The date the podcast was last updated. Defaults to `created_at`. |
| `locked` | `'yes'` or `'no'` | Optional | Whether the podcast is locked from being imported elsewhere. Defaults to `'no'`. |

### `Episode` Object Options

This is an array of objects, where each object represents a single episode.

| Key | Type | Required? | Description |
| :--- | :--- | :--- | :--- |
| `guid` | `string` | **Required** | A globally unique and permanent identifier for the episode. Using the audio file URL is not recommended. Use a UUID. |
| `title` | `string` | **Required** | The title of the episode. |
| `description`| `string` | **Required** | The episode's show notes. Can contain HTML. |
| `publication_date`|`Date` or `string`| **Required**| The date the episode was published. |
| `audio_url` | `string` | **Required** | The direct URL to the episode's audio file (e.g., `.mp3`, `.m4a`). |
| `audio_length`| `number` | **Required** | The size of the audio file **in bytes**. |
| `episode_slug`| `string` | **Required** | The URL-friendly slug for the episode page. |
| `image_url` | `string` | Optional | URL to episode-specific cover art. Overrides the main podcast image. |

---

## Usage Examples

### Example 1: Server-Side with Next.js (Recommended)

This is the ideal approach for modern React projects.

**File:** `app/podcasts/[slug]/rss.xml/route.js`
```javascript
import { NextResponse } from 'next/server';
import { generatePodcastRss } from 'podcast-rss-generator-js';

export async function GET(request, { params }) {
  // In a real app, you would fetch this data from a database or CMS.
  const podcastData = {
    title: 'My Awesome Podcast',
    description: 'A show about awesome things.',
    image_url: 'https://example.com/images/cover.png',
    podcast_slug: params.slug,
    owner: 'Jane Doe',
    itunes_owner_name: 'Jane Doe',
    itunes_owner_email: 'jane.doe@example.com',
    itunes_category: [{ text: 'Technology' }],
    id: 'a8b7c6d5-e4f3-a2b1-c0d9-e8f7a6b5c4d3',
    created_at: new Date(),
    explicit: false,
  };
  const episodes = [{
    guid: 'unique-episode-id-123',
    title: 'Our First Episode!',
    description: 'The description for our first episode.',
    publication_date: new Date(),
    audio_url: 'https://example.com/audio/ep1.mp3',
    audio_length: 34216300, // in bytes
    episode_slug: 'our-first-episode',
  }];

  const rssFeed = generatePodcastRss(podcastData, episodes, {
    siteUrl: 'https://www.example.com',
  });

  return new NextResponse(rssFeed, {
    status: 200,
    headers: { 'Content-Type': 'application/rss+xml' },
  });
}
```

### Example 2: Client-Side Demonstration

> **⚠️ Important:** This example is for demonstration only. A podcast feed generated this way **cannot** be submitted to Spotify or Apple Podcasts because it does not have a permanent public URL. It only exists inside your user's browser.

This component shows how to run the generator in the browser and lets the user view or download the output.

**File:** `src/PodcastGeneratorComponent.js`
```javascript
import React, { useState } from 'react';
import { generatePodcastRss } from 'podcast-rss-generator-js';

// --- Hardcode data for the demo ---
const podcastData = {
  title: 'My React Podcast',
  description: 'A demo podcast generated entirely in the browser.',
  image_url: 'https://example.com/images/cover.png',
  podcast_slug: 'my-react-podcast',
  owner: 'React Developer',
  itunes_owner_name: 'React Developer',
  itunes_owner_email: 'react.dev@example.com',
  itunes_category: [{ text: 'Technology' }],
  id: 'a8b7c6d5-e4f3-a2b1-c0d9-e8f7a6b5c4d4',
  created_at: new Date(),
  explicit: false,
};
const episodes = [{
  guid: 'demo-episode-1',
  title: 'Hello, React!',
  description: 'This episode was generated by a React component.',
  publication_date: new Date(),
  audio_url: 'https://example.com/audio/ep1.mp3',
  audio_length: 34216300,
  episode_slug: 'hello-react',
}];

function PodcastGeneratorComponent() {
  const [rssText, setRssText] = useState('');
  const [downloadLink, setDownloadLink] = useState('');

  const handleGenerateRss = () => {
    const feed = generatePodcastRss(podcastData, episodes, {
      siteUrl: 'https://www.example.com',
    });
    setRssText(feed);

    const blob = new Blob([feed], { type: 'application/rss+xml' });
    setDownloadLink(URL.createObjectURL(blob));
  };

  return (
    <div style={{ fontFamily: 'sans-serif', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h2>Podcast Feed Generator (Client-Side Demo)</h2>
      <p>Click the button to generate the XML feed inside the browser.</p>
      <button onClick={handleGenerateRss} style={{ padding: '10px 15px', marginBottom: '20px' }}>
        Generate RSS Feed
      </button>

      {rssText && (
        <div>
          <h3>Generated XML Output:</h3>
          <textarea
            readOnly
            value={rssText}
            style={{ width: '95%', height: '250px' }}
          />
          <br />
          <a
            href={downloadLink}
            download="rss.xml"
            style={{ display: 'inline-block', marginTop: '10px' }}
          >
            Download rss.xml file
          </a>
        </div>
      )}
    </div>
  );
}

export default PodcastGeneratorComponent;
```