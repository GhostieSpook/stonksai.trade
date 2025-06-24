const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  getUserPortfolio, 
  addToPortfolio, 
  removeFromPortfolio,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateUserProfile,
  getUserSettings
} = require('../services/userService');

// Get user portfolio
router.get('/portfolio', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolio = await getUserPortfolio(userId);
    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Add stock to portfolio
router.post('/portfolio', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, shares, avgPrice, purchaseDate } = req.body;
    
    if (!symbol || !shares || !avgPrice) {
      return res.status(400).json({ error: 'Symbol, shares, and average price are required' });
    }
    
    const result = await addToPortfolio(userId, { symbol, shares, avgPrice, purchaseDate });
    res.json(result);
  } catch (error) {
    console.error('Error adding to portfolio:', error);
    res.status(500).json({ error: 'Failed to add to portfolio' });
  }
});

// Update portfolio entry
router.put('/portfolio/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;
    
    const result = await updatePortfolioEntry(userId, id, updates);
    res.json(result);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({ error: 'Failed to update portfolio' });
  }
});

// Remove from portfolio
router.delete('/portfolio/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const result = await removeFromPortfolio(userId, id);
    res.json(result);
  } catch (error) {
    console.error('Error removing from portfolio:', error);
    res.status(500).json({ error: 'Failed to remove from portfolio' });
  }
});

// Get user watchlist
router.get('/watchlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const watchlist = await getWatchlist(userId);
    res.json(watchlist);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Add to watchlist
router.post('/watchlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, alertPrice } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const result = await addToWatchlist(userId, { symbol, alertPrice });
    res.json(result);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Remove from watchlist
router.delete('/watchlist/:symbol', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol } = req.params;
    
    const result = await removeFromWatchlist(userId, symbol);
    res.json(result);
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getUserProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    const result = await updateUserProfile(userId, updates);
    res.json(result);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await getUserSettings(userId);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = req.body;
    
    const result = await updateUserSettings(userId, settings);
    res.json(result);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get portfolio performance
router.get('/portfolio/performance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '1y' } = req.query;
    
    const performance = await getPortfolioPerformance(userId, period);
    res.json(performance);
  } catch (error) {
    console.error('Error fetching portfolio performance:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio performance' });
  }
});

// Get trading history
router.get('/trading-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const history = await getTradingHistory(userId, parseInt(limit), parseInt(offset));
    res.json(history);
  } catch (error) {
    console.error('Error fetching trading history:', error);
    res.status(500).json({ error: 'Failed to fetch trading history' });
  }
});

module.exports = router; 