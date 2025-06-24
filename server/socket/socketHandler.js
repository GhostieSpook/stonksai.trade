const { getStockData } = require('../services/stockService');
const { generateSignals } = require('../services/signalService');

// Store connected clients and their subscriptions
const connectedClients = new Map();
const stockSubscriptions = new Map();

// Handle socket connection
const handleSocketConnection = (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Initialize client data
  connectedClients.set(socket.id, {
    socket,
    subscriptions: new Set(),
    lastActivity: Date.now(),
    userId: null
  });

  // Handle authentication
  socket.on('authenticate', async (data) => {
    try {
      // In production, validate JWT token here
      const { token } = data;
      if (token) {
        // Decode and validate token
        const client = connectedClients.get(socket.id);
        if (client) {
          client.userId = 'user-id'; // Extract from token
          client.lastActivity = Date.now();
        }
        socket.emit('authenticated', { success: true });
      }
    } catch (error) {
      socket.emit('authenticated', { success: false, error: 'Authentication failed' });
    }
  });

  // Handle stock subscriptions
  socket.on('subscribe', async (data) => {
    try {
      const { symbols } = data;
      if (!Array.isArray(symbols)) {
        socket.emit('error', { message: 'Symbols must be an array' });
        return;
      }

      const client = connectedClients.get(socket.id);
      if (!client) return;

      // Add symbols to client subscriptions
      symbols.forEach(symbol => {
        const upperSymbol = symbol.toUpperCase();
        client.subscriptions.add(upperSymbol);
        
        // Add to global stock subscriptions
        if (!stockSubscriptions.has(upperSymbol)) {
          stockSubscriptions.set(upperSymbol, new Set());
        }
        stockSubscriptions.get(upperSymbol).add(socket.id);
      });

      // Send initial data for subscribed symbols
      for (const symbol of symbols) {
        try {
          const stockData = await getStockData(symbol);
          socket.emit('stockUpdate', {
            symbol: symbol.toUpperCase(),
            data: stockData,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error fetching initial data for ${symbol}:`, error);
        }
      }

      socket.emit('subscribed', { symbols, success: true });
    } catch (error) {
      socket.emit('error', { message: 'Subscription failed', error: error.message });
    }
  });

  // Handle unsubscription
  socket.on('unsubscribe', (data) => {
    try {
      const { symbols } = data;
      if (!Array.isArray(symbols)) {
        socket.emit('error', { message: 'Symbols must be an array' });
        return;
      }

      const client = connectedClients.get(socket.id);
      if (!client) return;

      // Remove symbols from client subscriptions
      symbols.forEach(symbol => {
        const upperSymbol = symbol.toUpperCase();
        client.subscriptions.delete(upperSymbol);
        
        // Remove from global stock subscriptions
        if (stockSubscriptions.has(upperSymbol)) {
          stockSubscriptions.get(upperSymbol).delete(socket.id);
          
          // Clean up empty subscriptions
          if (stockSubscriptions.get(upperSymbol).size === 0) {
            stockSubscriptions.delete(upperSymbol);
          }
        }
      });

      socket.emit('unsubscribed', { symbols, success: true });
    } catch (error) {
      socket.emit('error', { message: 'Unsubscription failed', error: error.message });
    }
  });

  // Handle signal requests
  socket.on('getSignals', async (data) => {
    try {
      const { symbol, timeframe = '1d' } = data;
      
      if (!symbol) {
        socket.emit('error', { message: 'Symbol is required' });
        return;
      }

      const signals = await generateSignals(symbol, timeframe);
      socket.emit('signals', {
        symbol: symbol.toUpperCase(),
        signals,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to generate signals', error: error.message });
    }
  });

  // Handle portfolio analysis requests
  socket.on('analyzePortfolio', async (data) => {
    try {
      const { stocks, riskTolerance = 'medium' } = data;
      
      if (!Array.isArray(stocks) || stocks.length === 0) {
        socket.emit('error', { message: 'Portfolio must contain at least one stock' });
        return;
      }

      // This would call the portfolio analysis service
      const analysis = {
        stocks: stocks.map(stock => ({
          symbol: stock.symbol,
          recommendation: ['buy', 'sell', 'hold'][Math.floor(Math.random() * 3)],
          confidence: Math.random() * 0.5 + 0.5
        })),
        overallRecommendation: 'neutral',
        riskLevel: riskTolerance,
        timestamp: new Date().toISOString()
      };

      socket.emit('portfolioAnalysis', analysis);
    } catch (error) {
      socket.emit('error', { message: 'Portfolio analysis failed', error: error.message });
    }
  });

  // Handle price alerts
  socket.on('setPriceAlert', (data) => {
    try {
      const { symbol, targetPrice, type = 'above' } = data;
      
      if (!symbol || !targetPrice) {
        socket.emit('error', { message: 'Symbol and target price are required' });
        return;
      }

      // Store price alert
      const alert = {
        symbol: symbol.toUpperCase(),
        targetPrice: parseFloat(targetPrice),
        type, // 'above' or 'below'
        socketId: socket.id,
        timestamp: new Date().toISOString()
      };

      // In production, store in database
      console.log('Price alert set:', alert);
      
      socket.emit('priceAlertSet', { success: true, alert });
    } catch (error) {
      socket.emit('error', { message: 'Failed to set price alert', error: error.message });
    }
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    const client = connectedClients.get(socket.id);
    if (client) {
      client.lastActivity = Date.now();
    }
    socket.emit('pong', { timestamp: Date.now() });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    const client = connectedClients.get(socket.id);
    if (client) {
      // Remove client from all stock subscriptions
      client.subscriptions.forEach(symbol => {
        if (stockSubscriptions.has(symbol)) {
          stockSubscriptions.get(symbol).delete(socket.id);
          
          // Clean up empty subscriptions
          if (stockSubscriptions.get(symbol).size === 0) {
            stockSubscriptions.delete(symbol);
          }
        }
      });
      
      connectedClients.delete(socket.id);
    }
  });

  // Send welcome message
  socket.emit('connected', {
    message: 'Connected to Stonks App WebSocket',
    timestamp: new Date().toISOString(),
    features: ['real-time-stocks', 'signals', 'portfolio-analysis', 'price-alerts']
  });
};

// Broadcast stock updates to subscribed clients
const broadcastStockUpdate = async (symbol, data) => {
  const subscribers = stockSubscriptions.get(symbol);
  if (!subscribers || subscribers.size === 0) return;

  const update = {
    symbol: symbol.toUpperCase(),
    data,
    timestamp: new Date().toISOString()
  };

  subscribers.forEach(socketId => {
    const client = connectedClients.get(socketId);
    if (client && client.socket) {
      client.socket.emit('stockUpdate', update);
    }
  });
};

// Broadcast market news
const broadcastMarketNews = (news) => {
  const update = {
    type: 'marketNews',
    data: news,
    timestamp: new Date().toISOString()
  };

  connectedClients.forEach(client => {
    if (client.socket) {
      client.socket.emit('marketUpdate', update);
    }
  });
};

// Broadcast market indices
const broadcastMarketIndices = (indices) => {
  const update = {
    type: 'marketIndices',
    data: indices,
    timestamp: new Date().toISOString()
  };

  connectedClients.forEach(client => {
    if (client.socket) {
      client.socket.emit('marketUpdate', update);
    }
  });
};

// Send notification to specific user
const sendUserNotification = (userId, notification) => {
  connectedClients.forEach(client => {
    if (client.userId === userId && client.socket) {
      client.socket.emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
    }
  });
};

// Send price alert
const sendPriceAlert = (socketId, alert) => {
  const client = connectedClients.get(socketId);
  if (client && client.socket) {
    client.socket.emit('priceAlert', {
      ...alert,
      timestamp: new Date().toISOString()
    });
  }
};

// Get connection statistics
const getConnectionStats = () => {
  return {
    totalConnections: connectedClients.size,
    activeSubscriptions: stockSubscriptions.size,
    subscribedSymbols: Array.from(stockSubscriptions.keys()),
    timestamp: new Date().toISOString()
  };
};

// Clean up inactive connections
const cleanupInactiveConnections = () => {
  const now = Date.now();
  const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

  connectedClients.forEach((client, socketId) => {
    if (now - client.lastActivity > inactiveThreshold) {
      console.log(`Disconnecting inactive client: ${socketId}`);
      client.socket.disconnect();
      connectedClients.delete(socketId);
    }
  });
};

// Start periodic cleanup
setInterval(cleanupInactiveConnections, 60 * 1000); // Every minute

module.exports = {
  handleSocketConnection,
  broadcastStockUpdate,
  broadcastMarketNews,
  broadcastMarketIndices,
  sendUserNotification,
  sendPriceAlert,
  getConnectionStats
}; 