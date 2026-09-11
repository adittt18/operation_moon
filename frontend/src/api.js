export async function readJsonResponse(response) {
  const body = await response.text();
  let data;

  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    throw new Error(`API returned a non-JSON response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(data?.detail || `API request failed (HTTP ${response.status}).`);
  }

  if (data === null) {
    throw new Error(`API returned an empty response (HTTP ${response.status}).`);
  }

  return data;
}