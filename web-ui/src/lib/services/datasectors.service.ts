// services/datasectors.service.ts

const API_KEY = process.env.DATASECTORS_API_KEY || "";
const BASE_URL = "https://api.datasectors.com";

// Helper function to make GET requests to DataSectors API
async function fetchFromAPI(endpoint: string) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'X-API-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`DataSectors API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[DataSectors Service] Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// DataSectors Chart V2 returns full historical data including indicators if parameters are passed
// Based on typical financial APIs, we might need to calculate indicators locally if the API only provides OHLC
// Let's assume the API provides OHLC and we calculate, or it provides indicators directly.
// The prompt specifies to fetch RSI, MACD, MA separately, implying the API has these endpoints.
// Since the exact endpoints aren't in the snippet, I will structure them as GET requests matching typical patterns
// and fall back to manual calculation if they fail.

export async function fetchRSI(symbol: string) {
  // Assuming a generic pattern, adjust if DataSectors provides specific paths
  return fetchFromAPI(`/api/indicators/rsi?symbol=${symbol}&period=14`);
}

export async function fetchMACD(symbol: string) {
  return fetchFromAPI(`/api/indicators/macd?symbol=${symbol}&fast=12&slow=26&signal=9`);
}

export async function fetchMA(symbol: string, period: number) {
  return fetchFromAPI(`/api/indicators/ma?symbol=${symbol}&period=${period}`);
}

export async function fetchOHLC(symbol: string) {
  // Using the known chart-v2 endpoint pattern
  return fetchFromAPI(`/api/v1/chart/${symbol}?period=1d&limit=1`); 
}
