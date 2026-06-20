import axios, { type AxiosInstance } from 'axios';

export function createApiClient(apiKey: string): AxiosInstance {
  return axios.create({
    baseURL: 'https://v3.football.api-sports.io',
    timeout: 20_000,
    headers: { 'x-apisports-key': apiKey },
  });
}

export async function fetchAllFixtures(client: AxiosInstance): Promise<unknown[]> {
  const { data } = await client.get('/fixtures', {
    params: { league: 1, season: 2026 },
  });
  return (data.response ?? []) as unknown[];
}

export async function fetchFixturePlayers(
  client: AxiosInstance,
  fixtureId: number,
): Promise<unknown[]> {
  const { data } = await client.get('/fixtures/players', {
    params: { fixture: fixtureId },
  });
  // api-sports signals rate-limit errors as HTTP 200 with errors.rateLimit set
  if (data.errors?.rateLimit) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
  return (data.response ?? []) as unknown[];
}

/** Pause execution. Used to space out requests within the rate limit. */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
