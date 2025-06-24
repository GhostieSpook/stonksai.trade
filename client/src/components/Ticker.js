import React, { useState, useEffect } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import '../styles/Ticker.css';

const Ticker = () => {
  const [tickerData, setTickerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        setError(null);
        // List of major indices and popular stocks
        const symbols = ['^GSPC', '^IXIC', '^DJI', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
        
        const response = await fetch('/api/stocks/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symbols }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Filter out failed requests and extract successful data
        const validData = data
          .filter(item => item.success && item.data)
          .map(item => item.data);
        
        setTickerData(validData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ticker data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchTickerData();
    const interval = setInterval(fetchTickerData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const renderTickerItem = (stock) => {
    if (!stock || typeof stock.price !== 'number' || typeof stock.change !== 'number') {
      return null;
    }
    
    const isUp = stock.change >= 0;
    const changePercent = stock.changePercent || 0;

    return (
      <div className="ticker-item" key={stock.symbol}>
        <span className="symbol">{stock.symbol}</span>
        <span className="price">${stock.price.toFixed(2)}</span>
        <span className={`change ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? (
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
          )}
          {stock.change.toFixed(2)} ({changePercent.toFixed(2)}%)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="ticker-wrap">
        <div className="ticker-item">Loading market data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticker-wrap">
        <div className="ticker-item text-red-400">Error loading market data: {error}</div>
      </div>
    );
  }

  if (tickerData.length === 0) {
    return (
      <div className="ticker-wrap">
        <div className="ticker-item">No market data available</div>
      </div>
    );
  }

  return (
    <div className="ticker-wrap">
      <div className="ticker">
        {tickerData.map(renderTickerItem)}
        {tickerData.map(renderTickerItem)} {/* Duplicate for seamless scroll */}
      </div>
    </div>
  );
};

export default Ticker; 