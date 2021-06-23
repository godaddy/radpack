import fetch from './fetch';

export default async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${ url }: ${ await res.text() }`);
  }
  const contentType = res.headers.get('content-type');
  return !contentType || contentType.includes('application/json')
    ? await res.json()
    : JSON.parse(await res.text());
};
