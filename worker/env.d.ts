interface R2Bucket {
  get(key: string): Promise<unknown>;
  put(key: string, value: unknown): Promise<unknown>;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
