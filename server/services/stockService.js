const axios = require('axios');
const { EMA, MACD, RSI, SMA, BollingerBands } = require('technicalindicators');
const { getCache, setCache } = require('../utils/cache');
const moment = require('moment');

// Finnhub API Configuration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Create axios instance with proper headers for Cloudflare tunneling
const finnhubClient = axios.create({
  baseURL: FINNHUB_BASE_URL,
  timeout: 10000,
  headers: {
    'X-Finnhub-Token': FINNHUB_API_KEY,
    'User-Agent': 'StonksApp/1.0',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Cache for storing API responses
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get stock data from Finnhub
async function getStockData(symbol) {
  const cacheKey = `stock_${symbol}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    // Get quote data
    const quoteResponse = await finnhubClient.get(`/quote?symbol=${symbol}`);
    const quote = quoteResponse.data;

    if (!quote || quote.c === 0) {
      throw new Error('No data found for symbol');
    }

    // Get company profile for additional info
    let profile = null;
    try {
      const profileResponse = await finnhubClient.get(`/stock/profile2?symbol=${symbol}`);
      profile = profileResponse.data;
    } catch (profileError) {
      console.warn(`Could not fetch profile for ${symbol}:`, profileError.message);
    }

    const stockData = {
      symbol: symbol,
      price: quote.c,
      change: quote.d,
      changePercent: quote.dp,
      volume: quote.v,
      previousClose: quote.pc,
      open: quote.o,
      high: quote.h,
      low: quote.l,
      marketCap: profile?.marketCapitalization || null,
      companyName: profile?.name || symbol,
      lastUpdated: new Date().toISOString()
    };

    setCache(cacheKey, stockData, 60); // Cache for 1 minute
    return stockData;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error.message);
    return null;
  }
}

async function getBatchStockData(symbols) {
  try {
    const promises = symbols.map(symbol => getStockData(symbol));
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      } else {
        console.warn(`Failed to fetch data for ${symbols[index]}:`, result.reason?.message);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error(`Error fetching batch stock data:`, error.message);
    return [];
  }
}

// Get historical data from Finnhub
async function getHistoricalData(symbol, period = '1y', interval = '1d') {
  const cacheKey = `history_${symbol}_${period}_${interval}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const endDate = Math.floor(Date.now() / 1000);
    let startDate;

    // Calculate start date based on period
    switch (period) {
      case '1d': startDate = endDate - (24 * 60 * 60); break;
      case '5d': startDate = endDate - (5 * 24 * 60 * 60); break;
      case '1mo': startDate = endDate - (30 * 24 * 60 * 60); break;
      case '6mo': startDate = endDate - (180 * 24 * 60 * 60); break;
      case '1y': startDate = endDate - (365 * 24 * 60 * 60); break;
      case '5y': startDate = endDate - (5 * 365 * 24 * 60 * 60); break;
      default: startDate = endDate - (365 * 24 * 60 * 60);
    }

    // Map interval to Finnhub format
    const intervalMap = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '60m': '60',
      '1d': 'D',
      '1w': 'W',
      '1M': 'M'
    };

    let finnhubInterval = intervalMap[interval] || 'D';

    // Try the requested interval first, fallback to daily if not allowed
    let response, data;
    try {
      response = await finnhubClient.get(`/stock/candle`, {
        params: {
          symbol: symbol,
          resolution: finnhubInterval,
          from: startDate,
          to: endDate
        }
      });
      data = response.data;
      if (data.s !== 'ok' || !data.t || data.t.length === 0) {
        throw new Error(data.error || 'No historical data available');
      }
    } catch (error) {
      // If Finnhub says access denied or not available, try daily as fallback
      if (
        (error.response && error.response.status === 403) ||
        (error.response && error.response.data && error.response.data.error)
      ) {
        if (finnhubInterval !== 'D') {
          // Try daily candles as fallback
          finnhubInterval = 'D';
          response = await finnhubClient.get(`/stock/candle`, {
            params: {
              symbol: symbol,
              resolution: finnhubInterval,
              from: startDate,
              to: endDate
            }
          });
          data = response.data;
          if (data.s !== 'ok' || !data.t || data.t.length === 0) {
            throw new Error(data.error || 'No historical data available');
          }
        } else {
          // If already daily, just throw the error
          throw new Error(
            (error.response && error.response.data && error.response.data.error) ||
            error.message ||
            'No historical data available'
          );
        }
      } else {
        throw error;
      }
    }

    const historicalData = data.t.map((timestamp, index) => ({
      date: moment.unix(timestamp).format('YYYY-MM-DD'),
      timestamp: timestamp,
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      volume: data.v[index],
    }));

    const result = {
      symbol,
      period,
      interval: finnhubInterval,
      data: historicalData,
      technicalIndicators: calculateTechnicalIndicators(historicalData),
      lastUpdated: new Date().toISOString()
    };

    setCache(cacheKey, result, 3600); // Cache for 1 hour
    return result;
  } catch (error) {
    // Pass along Finnhub error messages to the client
    throw new Error(error.message || 'Failed to fetch historical data');
  }
}

// Search stocks using Finnhub
async function searchStocks(query) {
  const cacheKey = `search_${query}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await finnhubClient.get(`/search?q=${encodeURIComponent(query)}`);
    const results = response.data.result || [];

    const formattedResults = results.map(item => ({
      symbol: item.symbol,
      name: item.description,
      type: item.type,
      region: item.primaryExchange || 'Unknown',
    }));

    setCache(cacheKey, formattedResults, 300); // Cache for 5 minutes
    return formattedResults;
  } catch (error) {
    console.error('Error searching stocks:', error.message);
    return [];
  }
}

// Calculate technical indicators
function calculateTechnicalIndicators(data) {
  if (!data || data.length === 0) return {};
  
  const closes = data.map(d => d.close);
  const volumes = data.map(d => d.volume);

  try {
    const sma20 = SMA.calculate({ period: 20, values: closes });
    const sma50 = SMA.calculate({ period: 50, values: closes });
    const sma200 = SMA.calculate({ period: 200, values: closes });
    const rsi = RSI.calculate({ period: 14, values: closes });
    const macd = MACD.calculate({ fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, values: closes });
    const bb = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 });

    return {
      sma20: sma20[sma20.length - 1] || null,
      sma50: sma50[sma50.length - 1] || null,
      sma200: sma200[sma200.length - 1] || null,
      rsi: rsi[rsi.length - 1] || null,
      macd: macd[macd.length - 1] || null,
      bollingerBands: bb[bb.length - 1] || null,
    };
  } catch (error) {
    console.error('Error calculating technical indicators:', error.message);
    return {};
  }
}

// Get stock fundamentals from Finnhub
async function getStockFundamentals(symbol) {
  const cacheKey = `fundamentals_${symbol}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    // Get company metrics
    const metricsResponse = await finnhubClient.get(`/stock/metric?symbol=${symbol}&metric=all`);
    const metrics = metricsResponse.data;

    // Get company profile
    const profileResponse = await finnhubClient.get(`/stock/profile2?symbol=${symbol}`);
    const profile = profileResponse.data;

    const fundamentals = {
      marketCap: profile?.marketCapitalization || null,
      peRatio: metrics?.metric?.peBasicExclExtraTTM || null,
      pbRatio: metrics?.metric?.pbAnnual || null,
      dividendYield: metrics?.metric?.dividendYieldIndicatedAnnual || null,
      eps: metrics?.metric?.epsBasicExclExtraTTM || null,
      revenue: metrics?.metric?.revenuePerShareTTM || null,
      debtToEquity: metrics?.metric?.totalDebtToEquity || null,
      returnOnEquity: metrics?.metric?.roeRfy || null,
      profitMargin: metrics?.metric?.netProfitMarginTTM || null,
      ...profile
    };

    setCache(cacheKey, fundamentals, 3600); // Cache for 1 hour
    return fundamentals;
  } catch (error) {
    console.error(`Error fetching fundamentals for ${symbol}:`, error.message);
    return { error: 'Could not fetch fundamentals.' };
  }
}

// Get market indices
async function getMarketIndices() {
  const cacheKey = 'market_indices';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const indices = ['^GSPC', '^IXIC', '^DJI', '^VIX'];
    const promises = indices.map(symbol => getStockData(symbol));
    const results = await Promise.allSettled(promises);
    
    const marketData = results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
      return null;
    }).filter(Boolean);

    setCache(cacheKey, marketData, 300); // Cache for 5 minutes
    return marketData;
  } catch (error) {
    console.error('Error fetching market indices:', error.message);
    return [];
  }
}

// Get company news
async function getCompanyNews(symbol, from = null, to = null) {
  try {
    const endDate = to || moment().format('YYYY-MM-DD');
    const startDate = from || moment().subtract(7, 'days').format('YYYY-MM-DD');

    const response = await finnhubClient.get(`/company-news`, {
      params: {
        symbol: symbol,
        from: startDate,
        to: endDate
      }
    });

    return response.data || [];
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error.message);
    return [];
  }
}

module.exports = {
  getStockData,
  getBatchStockData,
  getHistoricalData,
  searchStocks,
  calculateTechnicalIndicators,
  getStockFundamentals,
  getMarketIndices,
  getCompanyNews
}; 