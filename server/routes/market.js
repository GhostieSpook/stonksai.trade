const express = require('express');
const router = express.Router();
const { getMarketIndices, getMarketNews, getSectorPerformance, getMarketOverview, getTopMovers, getMarketCalendar, getMarketSentiment, getEconomicIndicators } = require('../services/marketService');

// Get market indices (S&P 500, NASDAQ, DOW, etc.)
router.get('/indices', async (req, res) => {
  try {
    const indices = await getMarketIndices();
    res.json(indices);
  } catch (error) {
    console.error('Error fetching market indices:', error);
    res.status(500).json({ error: 'Failed to fetch market indices' });
  }
});

// Get market news
router.get('/news', async (req, res) => {
  try {
    const { limit = 20, category = 'general' } = req.query;
    const news = await getMarketNews(parseInt(limit), category);
    res.json(news);
  } catch (error) {
    console.error('Error fetching market news:', error);
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
});

// Get sector performance
router.get('/sectors', async (req, res) => {
  try {
    const sectors = await getSectorPerformance();
    res.json(sectors);
  } catch (error) {
    console.error('Error fetching sector performance:', error);
    res.status(500).json({ error: 'Failed to fetch sector performance' });
  }
});

// Get market overview
router.get('/overview', async (req, res) => {
  try {
    const overview = await getMarketOverview();
    res.json(overview);
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

// Get top gainers and losers
router.get('/top-movers', async (req, res) => {
  try {
    const { type = 'both', limit = 10 } = req.query;
    const movers = await getTopMovers(type, parseInt(limit));
    res.json(movers);
  } catch (error) {
    console.error('Error fetching top movers:', error);
    res.status(500).json({ error: 'Failed to fetch top movers' });
  }
});

// Get market calendar (earnings, economic events)
router.get('/calendar', async (req, res) => {
  try {
    const { date, type = 'earnings' } = req.query;
    const calendar = await getMarketCalendar(date, type);
    res.json(calendar);
  } catch (error) {
    console.error('Error fetching market calendar:', error);
    res.status(500).json({ error: 'Failed to fetch market calendar' });
  }
});

// Get market sentiment
router.get('/sentiment', async (req, res) => {
  try {
    const sentiment = await getMarketSentiment();
    res.json(sentiment);
  } catch (error) {
    console.error('Error fetching market sentiment:', error);
    res.status(500).json({ error: 'Failed to fetch market sentiment' });
  }
});

// Get economic indicators
router.get('/economic-indicators', async (req, res) => {
  try {
    const indicators = await getEconomicIndicators();
    res.json(indicators);
  } catch (error) {
    console.error('Error fetching economic indicators:', error);
    res.status(500).json({ error: 'Failed to fetch economic indicators' });
  }
});

module.exports = router; 