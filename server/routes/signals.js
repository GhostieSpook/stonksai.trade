const express = require('express');
const router = express.Router();
const { generateSignals, analyzePortfolio, getSignalHistory } = require('../services/signalService');
const { validateSymbol } = require('../middleware/validation');

// Get AI trading signals for a specific stock
router.get('/:symbol', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1d' } = req.query;
    
    const signals = await generateSignals(symbol, timeframe);
    res.json(signals);
  } catch (error) {
    console.error('Error generating signals:', error);
    res.status(500).json({ error: 'Failed to generate trading signals' });
  }
});

// Analyze portfolio and get recommendations
router.post('/portfolio', async (req, res) => {
  try {
    const { stocks, riskTolerance = 'medium' } = req.body;
    
    if (!Array.isArray(stocks) || stocks.length === 0) {
      return res.status(400).json({ error: 'Stocks array is required' });
    }
    
    const analysis = await analyzePortfolio(stocks, riskTolerance);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing portfolio:', error);
    res.status(500).json({ error: 'Failed to analyze portfolio' });
  }
});

// Get signal history for a stock
router.get('/:symbol/history', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { days = 30 } = req.query;
    
    const history = await getSignalHistory(symbol, parseInt(days));
    res.json(history);
  } catch (error) {
    console.error('Error fetching signal history:', error);
    res.status(500).json({ error: 'Failed to fetch signal history' });
  }
});

// Analyze custom stock list
router.post('/analyze', async (req, res) => {
  try {
    const { symbols, analysisType = 'technical' } = req.body;
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array is required' });
    }
    
    const analysis = await analyzeStockList(symbols, analysisType);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing stock list:', error);
    res.status(500).json({ error: 'Failed to analyze stock list' });
  }
});

// Get market sentiment analysis
router.get('/sentiment/:symbol', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const sentiment = await getMarketSentiment(symbol);
    res.json(sentiment);
  } catch (error) {
    console.error('Error fetching sentiment:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment analysis' });
  }
});

// Get risk assessment for a stock
router.get('/risk/:symbol', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const risk = await getRiskAssessment(symbol);
    res.json(risk);
  } catch (error) {
    console.error('Error assessing risk:', error);
    res.status(500).json({ error: 'Failed to assess risk' });
  }
});

// Get optimal entry/exit points
router.get('/timing/:symbol', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1d' } = req.query;
    
    const timing = await getOptimalTiming(symbol, timeframe);
    res.json(timing);
  } catch (error) {
    console.error('Error getting timing signals:', error);
    res.status(500).json({ error: 'Failed to get timing signals' });
  }
});

module.exports = router; 