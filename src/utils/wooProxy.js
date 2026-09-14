/**
 * 🌐 WooCommerce & 17Track API proxy helpers
 */

export const WOO_CFG = {
  url: "https://irisnatures.com",
  key: "ck_6ecc49bb94d5c11308fb1c60ce30f220eb6e2302",
  sec: "cs_e0d7c58b3ec8093ba7aa5abc0b87186e7522d502"
};

const TRACK_API_KEY = "ECC6D924E26BE074DDDF0B6344EE82BC";

/**
 * Fetch WooCommerce API through multiple proxy strategies
 */
export async function fetchWithProxy(url, options = {}, isPut = false) {
  const urlObj = new URL(url);
  urlObj.searchParams.append('consumer_key', WOO_CFG.key);
  urlObj.searchParams.append('consumer_secret', WOO_CFG.sec);
  const urlWithParams = urlObj.toString();
  const encodedUrl = encodeURIComponent(urlWithParams);
  const authHeader = 'Basic ' + btoa(`${WOO_CFG.key}:${WOO_CFG.sec}`);
  
  const isWrite = isPut || (options.method && options.method !== 'GET');

  const directOpts = { 
    ...options, 
    headers: { 
      ...options.headers, 
      'Authorization': authHeader, 
      'Accept': 'application/json',
      ...(isWrite ? { 'Content-Type': 'application/json' } : {})
    } 
  };
  const proxyOpts = { 
    ...options, 
    headers: { 
      ...options.headers, 
      'Authorization': authHeader,
      'Accept': 'application/json', 
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    } 
  };

  const tryFetch = async (fetchUrl, fetchOptions) => {
    const res = await fetch(fetchUrl, fetchOptions);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return JSON.parse(await res.text());
  };

  // Always try direct first
  try { return await tryFetch(urlWithParams, directOpts); } catch (e) {}
  
  // For GET requests, try public proxies without auth
  if (!isWrite) {
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodedUrl}`);
      if (res.ok) { const data = await res.json(); if (data.contents) return JSON.parse(data.contents); }
    } catch (e) {}
  }
  
  // Try corsproxy.io with auth header (works for both GET and PUT/POST)
  try { return await tryFetch(`https://corsproxy.io/?${encodedUrl}`, proxyOpts); } catch (e) {}
  try { return await tryFetch(`https://api.codetabs.com/v1/proxy?quest=${urlWithParams}`, proxyOpts); } catch (e) {}
  throw new Error("Network request failed (CORS Error)");
}
