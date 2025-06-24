import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ChartBarIcon,
  GlobeAltIcon,
  BellIcon,
  CogIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Ticker from '../components/Ticker';
import StockScorecard from '../components/StockScorecard';

const Dashboard = () => {
  const [marketData, setMarketData] = useState({
    indices: [],
    topGainers: [],
    topLosers: [],
    news: []
  });
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDiscordBannerVisible, setIsDiscordBannerVisible] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  useEffect(() => {
    // Simulate loading market data
    setTimeout(() => {
      setMarketData({
        indices: [
          { name: 'S&P 500', price: 4567.89, change: 23.45, changePercent: 0.52 },
          { name: 'NASDAQ', price: 14234.56, change: -12.34, changePercent: -0.09 },
          { name: 'DOW', price: 34567.89, change: 45.67, changePercent: 0.13 }
        ],
        topGainers: [
          { symbol: 'TSLA', price: 245.67, change: 12.34, changePercent: 5.28 },
          { symbol: 'NVDA', price: 456.78, change: 23.45, changePercent: 5.41 },
          { symbol: 'AMD', price: 123.45, change: 8.90, changePercent: 7.76 }
        ],
        topLosers: [
          { symbol: 'AAPL', price: 178.90, change: -5.67, changePercent: -3.07 },
          { symbol: 'MSFT', price: 345.67, change: -12.34, changePercent: -3.45 },
          { symbol: 'GOOGL', price: 134.56, change: -4.32, changePercent: -3.11 }
        ],
        news: [
          { title: 'Federal Reserve Announces Interest Rate Decision', summary: 'The Fed maintains current rates amid economic uncertainty...' },
          { title: 'Tech Stocks Rally on Strong Earnings Reports', summary: 'Major technology companies exceed quarterly expectations...' },
          { title: 'Oil Prices Surge on Supply Concerns', summary: 'Crude oil futures rise as production cuts take effect...' }
        ]
      });
      setSignals([
        { symbol: 'TSLA', signal: 'buy', confidence: 0.85, reasoning: 'Strong technical indicators and positive momentum' },
        { symbol: 'NVDA', signal: 'hold', confidence: 0.72, reasoning: 'Mixed signals, wait for clearer direction' },
        { symbol: 'AAPL', signal: 'sell', confidence: 0.68, reasoning: 'Bearish pattern forming, consider taking profits' }
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  const handleConnectDiscord = () => {
    const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID;
    if (!clientId) {
      alert('Discord Client ID is not configured. Please check your .env file.');
      return;
    }
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&scope=applications.commands`;
    window.open(authUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading Stonks Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Ticker />
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Stonks</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-300 hover:text-white transition-colors">
                <BellIcon className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-300 hover:text-white transition-colors">
                <CogIcon className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-300 hover:text-white transition-colors">
                <UserIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stock Scorecard Selector */}
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            value={selectedSymbol}
            onChange={e => setSelectedSymbol(e.target.value.toUpperCase())}
            className="bg-white/10 border-white/20 border rounded-md px-3 py-1 text-white uppercase w-full max-w-xs"
            placeholder="Enter symbol (e.g., AAPL)"
            maxLength={10}
          />
        </div>
        {/* Stock Scorecard or prompt */}
        {selectedSymbol.trim() ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <StockScorecard symbol={selectedSymbol} />
          </motion.div>
        ) : (
          <div className="mb-8 text-white text-center">Enter a symbol to view the scorecard.</div>
        )}

        {/* Market Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {marketData.indices.map((index, idx) => (
            <div key={index.name} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{index.name}</h3>
                  <p className="text-2xl font-bold text-white">${index.price.toLocaleString()}</p>
                </div>
                <div className={`flex items-center space-x-1 ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {index.change >= 0 ? (
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Trading Signals */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-2 mb-6">
              <ChartBarIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">AI Trading Signals</h2>
            </div>
            <div className="space-y-4">
              {signals.map((signal, idx) => (
                <div key={signal.symbol} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      signal.signal === 'buy' ? 'bg-green-400' : 
                      signal.signal === 'sell' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}></div>
                    <div>
                      <p className="font-semibold text-white">{signal.symbol}</p>
                      <p className="text-sm text-gray-300">{signal.reasoning}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      signal.signal === 'buy' ? 'text-green-400' : 
                      signal.signal === 'sell' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {signal.signal.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-300">{(signal.confidence * 100).toFixed(1)}% confidence</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Movers */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-2 mb-6">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Top Movers</h2>
            </div>
            
            {/* Top Gainers */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-green-400 mb-3">Top Gainers</h3>
              <div className="space-y-3">
                {marketData.topGainers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <div>
                      <p className="font-semibold text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-300">${stock.price.toFixed(2)}</p>
                    </div>
                    <div className="text-green-400 text-right">
                      <p className="font-semibold">+{stock.change.toFixed(2)}</p>
                      <p className="text-sm">+{stock.changePercent.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div>
              <h3 className="text-lg font-medium text-red-400 mb-3">Top Losers</h3>
              <div className="space-y-3">
                {marketData.topLosers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                    <div>
                      <p className="font-semibold text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-300">${stock.price.toFixed(2)}</p>
                    </div>
                    <div className="text-red-400 text-right">
                      <p className="font-semibold">{stock.change.toFixed(2)}</p>
                      <p className="text-sm">{stock.changePercent.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Market News */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center space-x-2 mb-6">
            <GlobeAltIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Market News</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketData.news.map((article, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">{article.title}</h3>
                <p className="text-gray-300 text-sm">{article.summary}</p>
                <button className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium">
                  Read More →
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Discord Commands Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center space-x-2 mb-4">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Discord Bot Commands</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Stock Info</h3>
              <p className="text-gray-300 text-sm">/stock AAPL</p>
              <p className="text-gray-300 text-sm">/signals TSLA</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Portfolio</h3>
              <p className="text-gray-300 text-sm">/portfolio</p>
              <p className="text-gray-300 text-sm">/add AAPL 10 150</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Market Data</h3>
              <p className="text-gray-300 text-sm">/market</p>
              <p className="text-gray-300 text-sm">/news</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Alerts</h3>
              <p className="text-gray-300 text-sm">/alert TSLA 200 above</p>
              <p className="text-gray-300 text-sm">/alerts</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Discord Integration Banner */}
      {isDiscordBannerVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 shadow-lg z-50"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
              <div>
                <h3 className="text-lg font-semibold text-white">Connect with Stonks on Discord</h3>
                <p className="text-indigo-100 text-sm">Get real-time updates and use slash commands!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleConnectDiscord}
                className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Connect Discord
              </button>
              <button
                onClick={() => setIsDiscordBannerVisible(false)}
                className="p-2 text-white/70 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard; 