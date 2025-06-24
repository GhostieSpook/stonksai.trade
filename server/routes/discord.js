const express = require('express');
const router = express.Router();
const { sendDM } = require('../bot/discordBot');
const { getStockData } = require('../services/stockService');
const { generateSignals } = require('../services/signalService');
const { getMarketNews } = require('../services/marketService');

// Webhook endpoint for external integrations
router.post('/webhook', async (req, res) => {
  try {
    const { userId, type, data } = req.body;
    
    if (!userId || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let message = '';
    
    switch (type) {
      case 'price_alert':
        const { symbol, currentPrice, targetPrice, condition } = data;
        message = `🚨 **Price Alert**: ${symbol} is now $${currentPrice.toFixed(2)} (${condition} your target of $${targetPrice.toFixed(2)})`;
        break;
        
      case 'signal_alert':
        const { stockSymbol, signal, confidence, reasoning } = data;
        message = `📊 **AI Signal**: ${stockSymbol} - ${signal.toUpperCase()} (${(confidence * 100).toFixed(1)}% confidence)\nReasoning: ${reasoning}`;
        break;
        
      case 'news_alert':
        const { title, summary, url } = data;
        message = `📰 **Market News**: ${title}\n${summary}\nRead more: ${url}`;
        break;
        
      case 'portfolio_update':
        const { portfolioValue, change, changePercent } = data;
        const emoji = change >= 0 ? '📈' : '📉';
        message = `${emoji} **Portfolio Update**: Your portfolio is now worth $${portfolioValue.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)} | ${changePercent.toFixed(2)}%)`;
        break;
        
      case 'market_open':
        message = `🌅 **Market Open**: Trading session has begun! Check your portfolio and watchlist.`;
        break;
        
      case 'market_close':
        message = `🌆 **Market Close**: Trading session has ended. Review your daily performance.`;
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid notification type' });
    }
    
    await sendDM(userId, message);
    res.json({ success: true, message: 'Notification sent successfully' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Get available Discord commands
router.get('/commands', (req, res) => {
  const commands = [
    {
      name: 'stonks',
      description: 'Get current stock information',
      usage: '/stonks <symbol>',
      example: '/stonks AAPL'
    },
    {
      name: 'signals',
      description: 'Get AI trading signals for a stock',
      usage: '/signals <symbol>',
      example: '/signals TSLA'
    },
    {
      name: 'chart',
      description: 'Get stock chart data',
      usage: '/chart <symbol> [timeframe]',
      example: '/chart MSFT 1mo'
    },
    {
      name: 'portfolio',
      description: 'View your portfolio',
      usage: '/portfolio',
      example: '/portfolio'
    },
    {
      name: 'add',
      description: 'Add stock to portfolio',
      usage: '/add <symbol> <shares> <price>',
      example: '/add GOOGL 10 150.50'
    },
    {
      name: 'remove',
      description: 'Remove stock from portfolio',
      usage: '/remove <symbol>',
      example: '/remove AAPL'
    },
    {
      name: 'market',
      description: 'Get market overview',
      usage: '/market',
      example: '/market'
    },
    {
      name: 'indices',
      description: 'Check major market indices',
      usage: '/indices',
      example: '/indices'
    },
    {
      name: 'news',
      description: 'Get latest market news',
      usage: '/news [symbol]',
      example: '/news or /news AAPL'
    },
    {
      name: 'alert',
      description: 'Set price alert',
      usage: '/alert <symbol> <price> <above/below>',
      example: '/alert TSLA 200 above'
    },
    {
      name: 'alerts',
      description: 'View your active alerts',
      usage: '/alerts',
      example: '/alerts'
    },
    {
      name: 'remove-alert',
      description: 'Remove a price alert',
      usage: '/remove-alert <id>',
      example: '/remove-alert 1234567890'
    },
    {
      name: 'help',
      description: 'Show available commands',
      usage: '/help',
      example: '/help'
    },
    {
      name: 'about',
      description: 'About Stonks Bot',
      usage: '/about',
      example: '/about'
    }
  ];
  
  res.json({ 
    commands,
    info: {
      type: 'Global Application',
      availability: 'DMs and any server',
      privacy: 'All responses are private/ephemeral',
      setup: 'No server invite required'
    }
  });
});

// Send custom notification to user
router.post('/notify', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing userId or message' });
    }
    
    await sendDM(userId, message);
    res.json({ success: true, message: 'Notification sent successfully' });
    
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Bulk notification endpoint
router.post('/notify-bulk', async (req, res) => {
  try {
    const { notifications } = req.body;
    
    if (!Array.isArray(notifications)) {
      return res.status(400).json({ error: 'Notifications must be an array' });
    }
    
    const results = [];
    
    for (const notification of notifications) {
      try {
        const { userId, message } = notification;
        await sendDM(userId, message);
        results.push({ userId, success: true });
      } catch (error) {
        results.push({ userId: notification.userId, success: false, error: error.message });
      }
    }
    
    res.json({ 
      success: true, 
      results,
      summary: {
        total: notifications.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
    
  } catch (error) {
    console.error('Bulk notification error:', error);
    res.status(500).json({ error: 'Failed to send bulk notifications' });
  }
});

// Get bot status
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    version: '1.0.0',
    type: 'Global Application Bot',
    features: [
      'Global Slash Commands',
      'DM Support',
      'Private Responses',
      'Price Alerts',
      'Portfolio Tracking',
      'AI Trading Signals',
      'Market News',
      'Real-time Updates'
    ],
    availability: {
      dms: true,
      servers: 'any',
      setup: 'no invite required',
      privacy: 'ephemeral responses'
    }
  });
});

module.exports = router; 