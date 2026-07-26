import {analyzeSite} from "../services/analyze.service"

describe('analyzeSite — happy path', () => {
  const html = `
    <html>
      <head>
        <title>  Example Domain  </title>
        <meta name="description" content="A test page for Page Pulse" />
      </head>
      <body>
        <h1>Welcome</h1>
        <h1>Second heading</h1>
        <img src="a.png" alt="a nice picture" />
        <img src="b.png" alt="" />
        <img src="c.png" />
        <p>This is some sample body copy with a handful of words in it.</p>
        <script>var shouldNotBeCounted = "in word count";</script>
      </body>
    </html>
  `;

  it('extracts the title, trimmed', async () => {
    const result = await analyzeSite(html);
    expect(result.page_title).toBe('Example Domain');
  });

  it('extracts the meta description', async () => {
    const result = await analyzeSite(html);
    expect(result.meta_description).toBe('A test page for Page Pulse');
  });

  it('counts H1 tags correctly', async () => {
    const result = await analyzeSite(html);
    expect(result.h1_count).toBe(2);
  });

  it('counts images missing alt text — both empty alt="" and a fully absent alt attribute count', async () => {
    const result = await analyzeSite(html);
    // b.png has alt="" and c.png has no alt attribute at all -> 2 missing out of 3 total
    expect(result.images_missing_alt_text).toBe(2);
  });

  it('produces a word count that excludes <script> tag content', async () => {
    const result = await analyzeSite(html);
    // "Welcome"(1) + "Second heading"(2 words) + 13-word paragraph = 16 words.
    // If the script's JS code leaked into the count, this would be much higher.
    expect(result.word_count).toBe(16);
  });
});

describe('analyzeSite — failure case 1: empty HTML string', () => {
  it('does not throw, and returns safe zeroed/empty defaults', async () => {
    const result = await analyzeSite('');
    expect(result).toEqual({
      page_title: '',
      meta_description: '',
      h1_count: 0,
      images_missing_alt_text: 0,
      word_count: 0,
    });
  });
});

describe('analyzeSite — failure case 2: malformed / non-HTML garbage input', () => {
  it('does not throw on garbage bytes and control characters', async () => {
    const garbage = '\x00\x01 not even close to html {{{ ]]] <<< >>>';
    await expect(analyzeSite(garbage)).resolves.toBeDefined();
  });

  it('falls back to empty/zero fields when no real HTML structure is present', async () => {
    const garbage = '\x00\x01 not even close to html {{{ ]]] <<< >>>';
    const result = await analyzeSite(garbage);
    expect(result.page_title).toBe('');
    expect(result.h1_count).toBe(0);
    expect(result.images_missing_alt_text).toBe(0);
  });
});

describe('analyzeSite — additional edge case: page with no <body> tag at all', () => {
  it('falls back to $.root() for word counting instead of throwing', async () => {
    const html = '<title>No Body Here</title><h1>Loose heading</h1>';
    const result = await analyzeSite(html);
    expect(result.page_title).toBe('No Body Here');
    expect(result.h1_count).toBe(1);
    expect(result.word_count).toBeGreaterThan(0);
  });
});