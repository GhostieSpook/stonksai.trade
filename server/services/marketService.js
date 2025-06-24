const axios = require('axios');
const moment = require('moment');

// Cache for storing API responses
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Get market indices
async function getMarketIndices() {
  try {
    const cacheKey = 'market_indices';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const indices = [
      { symbol: '^GSPC', name: 'S&P 500', description: 'S&P 500 Index' },
      { symbol: '^DJI', name: 'Dow Jones', description: 'Dow Jones Industrial Average' },
      { symbol: '^IXIC', name: 'NASDAQ', description: 'NASDAQ Composite' },
      { symbol: '^RUT', name: 'Russell 2000', description: 'Russell 2000 Index' },
      { symbol: '^VIX', name: 'VIX', description: 'CBOE Volatility Index' }
    ];

    const indicesData = await Promise.allSettled(
      indices.map(async (index) => {
        try {
          const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${index.symbol}?interval=1d&range=1d`
          );
          
          if (response.data.chart.result && response.data.chart.result.length > 0) {
            const result = response.data.chart.result[0];
            const quote = result.indicators.quote[0];
            const currentPrice = quote.close[quote.close.length - 1];
            const previousClose = quote.close[quote.close.length - 2] || currentPrice;
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            return {
              ...index,
              price: currentPrice,
              change,
              changePercent,
              volume: quote.volume[quote.volume.length - 1] || 0,
              lastUpdated: new Date().toISOString()
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching ${index.symbol}:`, error.message);
          return null;
        }
      })
    );

    const validIndices = indicesData
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);

    cache.set(cacheKey, { data: validIndices, timestamp: Date.now() });
    return validIndices;
  } catch (error) {
    console.error('Error fetching market indices:', error);
    throw error;
  }
}

// Get market news
async function getMarketNews(limit = 20, category = 'general') {
  try {
    const cacheKey = `market_news_${category}_${limit}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Mock news data - in production, integrate with real news APIs
    const mockNews = [
      {
        id: 1,
        title: 'Federal Reserve Signals Potential Rate Cuts',
        summary: 'The Federal Reserve indicated possible interest rate reductions in the coming months.',
        source: 'Reuters',
        url: '#',
        publishedAt: moment().subtract(2, 'hours').toISOString(),
        category: 'monetary_policy',
        sentiment: 'neutral'
      },
      {
        id: 2,
        title: 'Tech Stocks Rally on Strong Earnings Reports',
        summary: 'Major technology companies report better-than-expected quarterly results.',
        source: 'Bloomberg',
        url: '#',
        publishedAt: moment().subtract(4, 'hours').toISOString(),
        category: 'earnings',
        sentiment: 'positive'
      },
      {
        id: 3,
        title: 'Oil Prices Decline on Supply Concerns',
        summary: 'Crude oil prices fall as global supply increases and demand weakens.',
        source: 'CNBC',
        url: '#',
        publishedAt: moment().subtract(6, 'hours').toISOString(),
        category: 'commodities',
        sentiment: 'negative'
      },
      {
        id: 4,
        title: 'Market Volatility Increases Amid Economic Uncertainty',
        summary: 'Investors remain cautious as economic indicators show mixed signals.',
        source: 'Wall Street Journal',
        url: '#',
        publishedAt: moment().subtract(8, 'hours').toISOString(),
        category: 'market_analysis',
        sentiment: 'neutral'
      },
      {
        id: 5,
        title: 'Cryptocurrency Market Shows Signs of Recovery',
        summary: 'Bitcoin and other digital assets gain momentum after recent sell-off.',
        source: 'CoinDesk',
        url: '#',
        publishedAt: moment().subtract(10, 'hours').toISOString(),
        category: 'cryptocurrency',
        sentiment: 'positive'
      }
    ];

    const filteredNews = category === 'general' 
      ? mockNews 
      : mockNews.filter(news => news.category === category);

    const limitedNews = filteredNews.slice(0, limit);

    cache.set(cacheKey, { data: limitedNews, timestamp: Date.now() });
    return limitedNews;
  } catch (error) {
    console.error('Error fetching market news:', error);
    throw error;
  }
}

// Get sector performance
async function getSectorPerformance() {
  try {
    const cacheKey = 'sector_performance';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Mock sector data - in production, fetch from real APIs
    const sectors = [
      { name: 'Technology', symbol: 'XLK', change: 2.5, changePercent: 1.8 },
      { name: 'Healthcare', symbol: 'XLV', change: -0.8, changePercent: -0.6 },
      { name: 'Financial Services', symbol: 'XLF', change: 1.2, changePercent: 0.9 },
      { name: 'Consumer Discretionary', symbol: 'XLY', change: 1.8, changePercent: 1.3 },
      { name: 'Communication Services', symbol: 'XLC', change: 0.5, changePercent: 0.4 },
      { name: 'Industrials', symbol: 'XLI', change: -0.3, changePercent: -0.2 },
      { name: 'Consumer Staples', symbol: 'XLP', change: 0.2, changePercent: 0.1 },
      { name: 'Energy', symbol: 'XLE', change: -1.5, changePercent: -1.2 },
      { name: 'Real Estate', symbol: 'XLRE', change: 0.8, changePercent: 0.6 },
      { name: 'Materials', symbol: 'XLB', change: -0.7, changePercent: -0.5 },
      { name: 'Utilities', symbol: 'XLU', change: 0.1, changePercent: 0.1 }
    ];

    cache.set(cacheKey, { data: sectors, timestamp: Date.now() });
    return sectors;
  } catch (error) {
    console.error('Error fetching sector performance:', error);
    throw error;
  }
}

// Get market overview
async function getMarketOverview() {
  try {
    const cacheKey = 'market_overview';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const indices = await getMarketIndices();
    const sectors = await getSectorPerformance();

    const overview = {
      timestamp: new Date().toISOString(),
      marketStatus: getMarketStatus(),
      indices: indices,
      sectors: sectors,
      marketBreadth: calculateMarketBreadth(),
      volatility: calculateMarketVolatility(),
      tradingVolume: calculateTradingVolume()
    };

    cache.set(cacheKey, { data: overview, timestamp: Date.now() });
    return overview;
  } catch (error) {
    console.error('Error fetching market overview:', error);
    throw error;
  }
}

// Get top movers
async function getTopMovers(type = 'both', limit = 10) {
  try {
    const cacheKey = `top_movers_${type}_${limit}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Mock top movers data
    const mockMovers = [
      { symbol: 'TSLA', name: 'Tesla Inc', change: 15.50, changePercent: 8.2, volume: 45000000 },
      { symbol: 'NVDA', name: 'NVIDIA Corp', change: 12.30, changePercent: 6.8, volume: 38000000 },
      { symbol: 'AAPL', name: 'Apple Inc', change: -8.20, changePercent: -4.1, volume: 52000000 },
      { symbol: 'MSFT', name: 'Microsoft Corp', change: 6.80, changePercent: 3.2, volume: 29000000 },
      { symbol: 'AMZN', name: 'Amazon.com Inc', change: -5.40, changePercent: -2.8, volume: 41000000 },
      { symbol: 'GOOGL', name: 'Alphabet Inc', change: 4.20, changePercent: 2.1, volume: 22000000 },
      { symbol: 'META', name: 'Meta Platforms Inc', change: -3.60, changePercent: -1.9, volume: 18000000 },
      { symbol: 'NFLX', name: 'Netflix Inc', change: 7.10, changePercent: 3.8, volume: 15000000 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', change: -4.80, changePercent: -2.5, volume: 32000000 },
      { symbol: 'CRM', name: 'Salesforce Inc', change: 3.40, changePercent: 1.7, volume: 12000000 }
    ];

    let filteredMovers;
    if (type === 'gainers') {
      filteredMovers = mockMovers.filter(mover => mover.changePercent > 0);
    } else if (type === 'losers') {
      filteredMovers = mockMovers.filter(mover => mover.changePercent < 0);
    } else {
      filteredMovers = mockMovers;
    }

    const sortedMovers = filteredMovers.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    const limitedMovers = sortedMovers.slice(0, limit);

    cache.set(cacheKey, { data: limitedMovers, timestamp: Date.now() });
    return limitedMovers;
  } catch (error) {
    console.error('Error fetching top movers:', error);
    throw error;
  }
}

// Get market calendar
async function getMarketCalendar(date, type = 'earnings') {
  try {
    const targetDate = date ? moment(date) : moment();
    
    // Mock calendar data
    const mockCalendar = [
      {
        date: targetDate.format('YYYY-MM-DD'),
        type: 'earnings',
        symbol: 'AAPL',
        name: 'Apple Inc',
        time: 'AMC',
        estimate: 1.45,
        actual: null,
        status: 'upcoming'
      },
      {
        date: targetDate.format('YYYY-MM-DD'),
        type: 'earnings',
        symbol: 'MSFT',
        name: 'Microsoft Corp',
        time: 'AMC',
        estimate: 2.78,
        actual: null,
        status: 'upcoming'
      },
      {
        date: targetDate.add(1, 'day').format('YYYY-MM-DD'),
        type: 'economic',
        name: 'Federal Reserve Meeting',
        description: 'FOMC Interest Rate Decision',
        time: '2:00 PM ET',
        impact: 'high'
      },
      {
        date: targetDate.add(2, 'days').format('YYYY-MM-DD'),
        type: 'earnings',
        symbol: 'TSLA',
        name: 'Tesla Inc',
        time: 'AMC',
        estimate: 0.85,
        actual: null,
        status: 'upcoming'
      }
    ];

    const filteredCalendar = type === 'all' 
      ? mockCalendar 
      : mockCalendar.filter(event => event.type === type);

    return filteredCalendar;
  } catch (error) {
    console.error('Error fetching market calendar:', error);
    throw error;
  }
}

// Get market sentiment
async function getMarketSentiment() {
  try {
    const cacheKey = 'market_sentiment';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Mock sentiment data
    const sentiment = {
      overall: {
        score: 0.65,
        label: 'bullish',
        confidence: 0.78
      },
      fearGreedIndex: 72,
      vixLevel: 18.5,
      putCallRatio: 0.85,
      marketBreadth: {
        advancing: 2456,
        declining: 1892,
        unchanged: 156
      },
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, { data: sentiment, timestamp: Date.now() });
    return sentiment;
  } catch (error) {
    console.error('Error fetching market sentiment:', error);
    throw error;
  }
}

// Get economic indicators
async function getEconomicIndicators() {
  try {
    const cacheKey = 'economic_indicators';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Mock economic indicators
    const indicators = [
      {
        name: 'GDP Growth Rate',
        value: '2.1%',
        previous: '1.9%',
        change: 0.2,
        trend: 'up',
        date: moment().subtract(1, 'month').format('YYYY-MM-DD')
      },
      {
        name: 'Unemployment Rate',
        value: '3.7%',
        previous: '3.8%',
        change: -0.1,
        trend: 'down',
        date: moment().subtract(2, 'weeks').format('YYYY-MM-DD')
      },
      {
        name: 'Inflation Rate (CPI)',
        value: '3.2%',
        previous: '3.4%',
        change: -0.2,
        trend: 'down',
        date: moment().subtract(1, 'week').format('YYYY-MM-DD')
      },
      {
        name: 'Federal Funds Rate',
        value: '5.25%',
        previous: '5.25%',
        change: 0,
        trend: 'stable',
        date: moment().subtract(3, 'days').format('YYYY-MM-DD')
      }
    ];

    cache.set(cacheKey, { data: indicators, timestamp: Date.now() });
    return indicators;
  } catch (error) {
    console.error('Error fetching economic indicators:', error);
    throw error;
  }
}

// Helper functions
function getMarketStatus() {
  const now = moment();
  const marketOpen = moment().set({ hour: 9, minute: 30, second: 0 });
  const marketClose = moment().set({ hour: 16, minute: 0, second: 0 });
  
  if (now.isBefore(marketOpen) || now.isAfter(marketClose)) {
    return 'closed';
  }
  return 'open';
}

function calculateMarketBreadth() {
  return {
    advancing: Math.floor(Math.random() * 2000) + 1500,
    declining: Math.floor(Math.random() * 1500) + 1000,
    unchanged: Math.floor(Math.random() * 200) + 100
  };
}

function calculateMarketVolatility() {
  return Math.random() * 20 + 10; // 10-30% volatility
}

function calculateTradingVolume() {
  return Math.floor(Math.random() * 5000000000) + 2000000000; // 2-7 billion shares
}

module.exports = {
  getMarketIndices,
  getMarketNews,
  getSectorPerformance,
  getMarketOverview,
  getTopMovers,
  getMarketCalendar,
  getMarketSentiment,
  getEconomicIndicators
}; 