import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

const AVAILABLE_PERIODS = [
  { label: '1M', value: '1mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' }
];

const StockChart = () => {
  const chartContainerRef = useRef();
  const [symbol, setSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('1y');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.2)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.2)' },
      },
      crosshair: { mode: 'normal' },
      rightPriceScale: { borderColor: 'rgba(197, 203, 206, 0.4)' },
      timeScale: { borderColor: 'rgba(197, 203, 206, 0.4)' },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    });

    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/stocks/${symbol}/history?period=${period}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.data || result.data.length === 0) {
          throw new Error('No chart data available');
        }
        
        const chartData = result.data;
        
        // Format data for lightweight-charts
        const formattedData = chartData.map(item => ({
          time: item.date,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
        })).filter(item => 
          !isNaN(item.open) && !isNaN(item.high) && 
          !isNaN(item.low) && !isNaN(item.close)
        );
        
        if (formattedData.length === 0) {
          throw new Error('No valid chart data available');
        }
        
        candleSeries.setData(formattedData);
        chart.timeScale().fitContent();
        
      } catch (error) {
        console.error(`Error fetching chart data:`, error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
    
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol, period]);

  const handleSymbolChange = (e) => {
    const value = e.target.value.trim().toUpperCase();
    if (value) {
      setSymbol(value);
    }
  };
  
  const handleSymbolSubmit = (e) => {
    e.preventDefault();
    // The useEffect will handle the data fetching when symbol changes
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <form onSubmit={handleSymbolSubmit} className="flex items-center space-x-4">
          <input
            type="text"
            value={symbol}
            onChange={handleSymbolChange}
            className="bg-white/10 border-white/20 border rounded-md px-3 py-1 text-white uppercase placeholder-gray-400"
            placeholder="Symbol (e.g., AAPL)"
            maxLength="10"
          />
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md text-sm transition-colors"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Update'}
          </button>
        </form>
        <div className="flex space-x-2">
          {AVAILABLE_PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handlePeriodChange(value)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                period === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
              disabled={loading}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-300 text-sm">
          {error.includes('access to this resource') ? (
            <>
              <b>Finnhub Free Tier Limitation:</b> This chart period or symbol is not available with a free API key.<br />
              Try a shorter period or a different stock.<br />
              <span className="text-xs">(Upgrade your Finnhub plan for more data.)</span>
            </>
          ) : (
            <>Error: {error}</>
          )}
        </div>
      )}
      
      <div ref={chartContainerRef} style={{ position: 'relative' }} />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
          <div className="text-white">Loading chart data...</div>
        </div>
      )}
    </div>
  );
};

export default StockChart; 