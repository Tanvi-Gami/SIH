const fetch = require('node-fetch');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Thin client for the FastAPI AI/intelligence microservice.
 * Any network failure is converted into a clear 503 rather than leaking
 * a raw connection error to the frontend — the AI service is a companion
 * process, not a hard dependency of the whole platform.
 */
async function callAI(pathname, { method = 'POST', body, query } = {}) {
  let url = `${env.fastapiUrl}${pathname}`;
  if (query) {
    const cleaned = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== null));
    const qs = new URLSearchParams(cleaned).toString();
    url += `?${qs}`;
  }
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      timeout: 20000,
    });
  } catch (err) {
    throw new ApiError(503, 'The AI service is currently unavailable. Please try again shortly.');
  }
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new ApiError(res.status, data.detail || data.message || 'AI service request failed.');
  }
  return data;
}

module.exports = { callAI };
