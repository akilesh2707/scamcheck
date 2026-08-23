import axios from 'axios';
import * as cheerio from 'cheerio';
import * as dns from 'dns';
import { promisify } from 'util';
import ipaddr from 'ipaddr.js';
import { logger } from './logger';

const lookup = promisify(dns.lookup);

export interface FetchResult {
  text: string;
  urls: string[];
  title: string;
}

export class FetchError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'FetchError';
  }
}

const isSafeIp = (ipStr: string): boolean => {
  try {
    const addr = ipaddr.parse(ipStr);
    const range = addr.range();
    const unsafeRanges = [
      'unspecified',
      'broadcast',
      'multicast',
      'linkLocal',
      'loopback',
      'private',
      'carrierGradeNat',
      'ipv4Mapped',
      'rfc6145',
      'rfc6052',
      '6to4',
      'teredo',
    ];
    return !unsafeRanges.includes(range);
  } catch (err) {
    return false;
  }
};

const MAX_REDIRECTS = 3;

export const fetchUrlSafely = async (targetUrl: string, redirects = 0): Promise<FetchResult> => {
  if (redirects > MAX_REDIRECTS) {
    throw new FetchError('Too many redirects', 'TOO_MANY_REDIRECTS');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (err) {
    throw new FetchError('Invalid URL format', 'INVALID_URL');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new FetchError('Only HTTP/HTTPS protocols are allowed', 'UNSUPPORTED_PROTOCOL');
  }

  const hostname = parsedUrl.hostname;

  let ipStr: string;
  try {
    const lookupResult = await lookup(hostname);
    ipStr = lookupResult.address;
  } catch (err) {
    throw new FetchError('Failed to resolve hostname', 'DNS_RESOLUTION_FAILED');
  }

  if (!isSafeIp(ipStr)) {
    throw new FetchError('URL points to a restricted internal or private IP address', 'SSRF_BLOCKED');
  }

  try {
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      maxContentLength: 5 * 1024 * 1024,
      maxRedirects: 0, // Disable automatic redirects for SSRF protection
      responseType: 'text',
      validateStatus: (status) => (status >= 200 && status < 300) || (status >= 300 && status < 400),
      headers: {
        'User-Agent': 'ScamCheck-Bot/1.0',
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.location;
      if (!location) {
        throw new FetchError('Redirect location missing', 'INVALID_REDIRECT');
      }
      const absoluteUrl = new URL(location, targetUrl).href;
      return fetchUrlSafely(absoluteUrl, redirects + 1);
    }

    if (typeof response.data !== 'string') {
       throw new FetchError('Response was not valid text/html', 'INVALID_CONTENT');
    }

    const html = response.data;
    const $ = cheerio.load(html);

    $('script, style, noscript, svg, img, video, audio, iframe').remove();
    const title = $('title').text().trim();
    const bodyText = $('body').text();
    const text = bodyText.replace(/\s+/g, ' ').trim();

    const urls = new Set<string>();
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, targetUrl).href;
          if (absoluteUrl.startsWith('http')) {
            urls.add(absoluteUrl);
          }
        } catch (e) {
          // ignore invalid URLs
        }
      }
    });

    return {
      text: text.substring(0, 50000),
      urls: Array.from(urls),
      title,
    };
  } catch (err: any) {
    if (err instanceof FetchError) throw err;
    logger.error('Safe fetch failed', { url: targetUrl, error: err.message });
    throw new FetchError(`Failed to fetch URL: ${err.message}`, 'FETCH_FAILED');
  }
};
