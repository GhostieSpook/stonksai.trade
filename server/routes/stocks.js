const express = require('express');
const router = express.Router();
const { 
  getStockData, 
  getHistoricalData, 
  searchStocks, 
  getBatchStockData,
  getStockFundamentals,
  getMarketIndices,
  getCompanyNews
} = require('../services/stockService');
const { validateSymbol } = require('../middleware/validation');
const yahooFinance = require('yahoo-finance2').default;
const axios = require('axios');

// Get current stock data
router.get('/:symbol', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await getStockData(symbol);
    
    if (!data) {
      return res.status(404).json({ error: 'Stock data not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Get historical data
router.get('/:symbol/history', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1y', interval = '1d' } = req.query;
    const data = await getHistoricalData(symbol, period, interval);
    res.json(data);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch historical data' });
  }
});

// Search stocks
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    const results = await searchStocks(query);
    res.json(results);
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

// Get multiple stocks data
router.post('/batch', async (req, res) => {
  try {
    const { symbols } = req.body;
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array is required' });
    }
    
    if (symbols.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 symbols allowed per request' });
    }
    
    const rawData = await getBatchStockData(symbols);
    
    const responseData = symbols.map(symbol => {
      const stockData = rawData.find(d => d.symbol === symbol);
      return {
        symbol: symbol,
        success: !!stockData,
        data: stockData,
        error: stockData ? null : 'No data found'
      };
    });
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching batch stock data:', error);
    res.status(500).json({ error: 'Failed to fetch batch stock data' });
  }
});

// Get stock fundamentals
router.get('/:symbol/fundamentals', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const fundamentals = await getStockFundamentals(symbol);
    res.json(fundamentals);
  } catch (error) {
    console.error('Error fetching fundamentals:', error);
    res.status(500).json({ error: 'Failed to fetch fundamentals' });
  }
});

// Get market indices
router.get('/market/indices', async (req, res) => {
  try {
    const indices = await getMarketIndices();
    res.json(indices);
  } catch (error) {
    console.error('Error fetching market indices:', error);
    res.status(500).json({ error: 'Failed to fetch market indices' });
  }
});

// Get company news
router.get('/:symbol/news', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { from, to } = req.query;
    const news = await getCompanyNews(symbol, from, to);
    res.json(news);
  } catch (error) {
    console.error('Error fetching company news:', error);
    res.status(500).json({ error: 'Failed to fetch company news' });
  }
});

// News Feed route using NewsAPI.org
router.get('/:symbol/newsfeed', async (req, res) => {
  const { symbol } = req.params;
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  if (!NEWS_API_KEY) return res.status(500).json({ error: 'NEWS_API_KEY not configured' });
  try {
    // Try to get company news
    let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(symbol)}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
    let response = await axios.get(url);
    let articles = response.data.articles || [];
    // If no articles, fallback to business headlines
    if (articles.length === 0) {
      url = `https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${NEWS_API_KEY}`;
      response = await axios.get(url);
      articles = response.data.articles || [];
    }
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch news' });
  }
});

// Stock Scorecard route
router.get('/:symbol/scorecard', validateSymbol, async (req, res) => {
  const { symbol } = req.params;
  // Helper: Yahoo fallback
  async function yahooScorecard(symbol) {
    try {
      // Get quote summary (fundamentals)
      const summary = await yahooFinance.quoteSummary(symbol, { modules: ['summaryDetail', 'financialData', 'price'] });
      const fundamentals = {
        peRatio: summary.summaryDetail?.trailingPE || summary.financialData?.trailingPE || null,
        dividendYield: summary.summaryDetail?.dividendYield || null,
        profitMargin: summary.financialData?.profitMargins || null,
        eps: summary.defaultKeyStatistics?.trailingEps || summary.financialData?.epsTrailingTwelveMonths || null,
        debtToEquity: summary.financialData?.debtToEquity || null,
      };
      // Get recent performance (1M, 6M, 1Y returns)
      let performance = {};
      const now = new Date();
      const periods = {
        '1M': new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
        '6M': new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
        '1Y': new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      };
      const hist = await yahooFinance.historical(symbol, { period1: periods['1Y'], period2: now, interval: '1d' });
      ['1M', '6M', '1Y'].forEach(label => {
        const startDate = periods[label];
        const start = hist.find(d => new Date(d.date) >= startDate);
        const end = hist[hist.length - 1];
        if (start && end) {
          performance[label] = ((end.close - start.close) / start.close) * 100;
        } else {
          performance[label] = null;
        }
      });
      // No analyst or news sentiment for fallback
      return {
        fundamentals,
        analyst: null,
        newsSentiment: 'neutral',
        performance,
        pros: [],
        cons: []
      };
    } catch (e) {
      return { error: 'Yahoo Finance fallback failed: ' + (e.message || e) };
    }
  }
  try {
    // Try Finnhub first
    let fundamentals, analyst, newsSentiment, performance, pros, cons;
    try {
      fundamentals = await getStockFundamentals(symbol);
      // Analyst
      let analystData = null;
      try {
        const axios = require('axios');
        const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
        const recRes = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
        analystData = recRes.data && recRes.data.length > 0 ? recRes.data[0] : null;
      } catch (e) { analystData = null; }
      analyst = analystData;
      // News
      newsSentiment = 'neutral';
      try {
        const news = await getCompanyNews(symbol);
        if (news && news.length > 0) {
          const positive = news.filter(n => n.headline.toLowerCase().includes('beat') || n.summary.toLowerCase().includes('positive')).length;
          const negative = news.filter(n => n.headline.toLowerCase().includes('miss') || n.summary.toLowerCase().includes('negative')).length;
          if (positive > negative) newsSentiment = 'positive';
          else if (negative > positive) newsSentiment = 'negative';
        }
      } catch (e) {}
      // Performance
      performance = {};
      try {
        const now = Math.floor(Date.now() / 1000);
        const periods = {
          '1M': now - 30 * 24 * 60 * 60,
          '6M': now - 180 * 24 * 60 * 60,
          '1Y': now - 365 * 24 * 60 * 60
        };
        const axios = require('axios');
        const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
        for (const [label, from] of Object.entries(periods)) {
          const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${now}&token=${FINNHUB_API_KEY}`;
          const resp = await axios.get(url);
          const data = resp.data;
          if (data.s === 'ok' && data.c && data.c.length > 1) {
            const ret = ((data.c[data.c.length - 1] - data.c[0]) / data.c[0]) * 100;
            performance[label] = ret;
          } else {
            performance[label] = null;
          }
        }
      } catch (e) {}
      // Pros/cons
      pros = [];
      cons = [];
      if (fundamentals.peRatio && fundamentals.peRatio < 20) pros.push('Low P/E ratio');
      if (fundamentals.dividendYield && fundamentals.dividendYield > 0) pros.push('Pays a dividend');
      if (performance['1Y'] && performance['1Y'] > 0) pros.push('Positive 1Y return');
      if (analyst && analyst.buy > analyst.sell) pros.push('Analyst consensus: Buy');
      if (newsSentiment === 'positive') pros.push('Recent news sentiment is positive');
      if (fundamentals.peRatio && fundamentals.peRatio > 30) cons.push('High P/E ratio');
      if (performance['1Y'] && performance['1Y'] < 0) cons.push('Negative 1Y return');
      if (analyst && analyst.sell > analyst.buy) cons.push('Analyst consensus: Sell');
      if (newsSentiment === 'negative') cons.push('Recent news sentiment is negative');
      // If Finnhub returns an error or access denied, fallback
      if (fundamentals.error || (typeof fundamentals === 'object' && Object.values(fundamentals).join('').includes('access to this resource'))) {
        throw new Error('Finnhub access denied');
      }
      return res.json({ fundamentals, analyst, newsSentiment, performance, pros, cons });
    } catch (err) {
      // Fallback to Yahoo Finance
      const yahoo = await yahooScorecard(symbol);
      if (yahoo.error) return res.status(404).json({ error: yahoo.error });
      return res.json(yahoo);
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch scorecard' });
  }
});

module.exports = router; 