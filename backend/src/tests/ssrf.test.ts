import { fetchUrlSafely, FetchError } from '../utils/urlFetcher';

describe('SSRF Protection', () => {
  it('should block localhost', async () => {
    await expect(fetchUrlSafely('http://localhost:5001')).rejects.toThrow(FetchError);
    await expect(fetchUrlSafely('http://localhost:5001')).rejects.toThrow('URL points to a restricted internal or private IP address');
  });

  it('should block 127.0.0.1', async () => {
    await expect(fetchUrlSafely('http://127.0.0.1')).rejects.toThrow(FetchError);
  });

  it('should block 0.0.0.0', async () => {
    await expect(fetchUrlSafely('http://0.0.0.0')).rejects.toThrow(FetchError);
  });

  it('should block private IPv4 (e.g. 192.168.1.1)', async () => {
    await expect(fetchUrlSafely('http://192.168.1.1')).rejects.toThrow(FetchError);
  });

  it('should block AWS metadata endpoint (169.254.169.254)', async () => {
    await expect(fetchUrlSafely('http://169.254.169.254')).rejects.toThrow(FetchError);
  });

  it('should allow safe public endpoints', async () => {
    // This assumes network is available during testing
    const result = await fetchUrlSafely('https://example.com');
    expect(result.text).toBeDefined();
    expect(result.title).toBeDefined();
  }, 10000);
});
