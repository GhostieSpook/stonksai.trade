import React, { useEffect, useState } from 'react';

const INDICATOR_COLORS = {
  good: 'text-green-400',
  bad: 'text-red-400',
  neutral: 'text-yellow-400',
};

function getIndicator(value, good, bad) {
  if (value === null || value === undefined) return INDICATOR_COLORS.neutral;
  if (good(value)) return INDICATOR_COLORS.good;
  if (bad(value)) return INDICATOR_COLORS.bad;
  return INDICATOR_COLORS.neutral;
}

const StockScorecard = ({ symbol = 'AAPL' }) => {
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/stocks/${symbol}/scorecard`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setScorecard(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [symbol]);

  if (loading) return <div className="p-4 text-white">Loading scorecard...</div>;
  if (error) return <div className="p-4 text-red-400">Error: {error}</div>;
  if (!scorecard) return null;

  const { fundamentals, analyst, newsSentiment, performance, pros, cons } = scorecard;

  // If all fundamentals are N/A, treat as ETF/Index and show only relevant info
  const allNA = !fundamentals.peRatio && !fundamentals.dividendYield && !fundamentals.profitMargin && !fundamentals.eps && !fundamentals.debtToEquity;
  if (allNA) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 mb-8 w-full">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">ETF/Index Scorecard: <span className="text-blue-400">{symbol}</span></h2>
        {/* Performance */}
        <div className="mb-4">
          <h3 className="font-semibold text-white mb-2 text-base sm:text-lg">Recent Performance</h3>
          <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-sm sm:text-base">
            {['1M', '6M', '1Y'].map(label => (
              <li key={label}>
                <span className="font-medium">{label}:</span>{' '}
                <span className={getIndicator(performance[label], v => v > 0, v => v < 0)}>
                  {performance[label] !== null && performance[label] !== undefined ? performance[label].toFixed(2) + '%' : 'N/A'}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* Dividend Yield if available */}
        {fundamentals.dividendYield ? (
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-2 text-base sm:text-lg">Dividend Yield</h3>
            <span className="text-green-400 font-semibold">{(fundamentals.dividendYield * 100).toFixed(2)}%</span>
          </div>
        ) : null}
        {/* News Sentiment */}
        <div className="mb-4">
          <h3 className="font-semibold text-white mb-2 text-base sm:text-lg">News Sentiment</h3>
          <span className={newsSentiment === 'positive' ? INDICATOR_COLORS.good : newsSentiment === 'negative' ? INDICATOR_COLORS.bad : INDICATOR_COLORS.neutral}>
            {newsSentiment.charAt(0).toUpperCase() + newsSentiment.slice(1)}
          </span>
        </div>
        {/* Yahoo Finance link */}
        <div className="mb-4">
          <a
            href={`https://finance.yahoo.com/quote/${symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline text-sm"
          >
            View more details and top holdings on Yahoo Finance
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 mb-8 w-full">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Stock Scorecard: <span className="text-blue-400">{symbol}</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Fundamentals */}
        <div>
          <h3 className="font-semibold text-white mb-2 text-base sm:text-lg">Fundamentals</h3>
          <ul className="text-sm sm:text-base">
            <li>
              <span className="font-medium">P/E Ratio:</span>{' '}
              <span className={getIndicator(fundamentals.peRatio, v => v < 20, v => v > 30)}>
                {fundamentals.peRatio ? fundamentals.peRatio.toFixed(2) : 'N/A'}
              </span>
            </li>
            <li>
              <span className="font-medium">Dividend Yield:</span>{' '}
              <span className={getIndicator(fundamentals.dividendYield, v => v > 0, v => v === 0)}>
                {fundamentals.dividendYield ? (fundamentals.dividendYield * 100).toFixed(2) + '%' : 'N/A'}
              </span>
            </li>
            <li>
              <span className="font-medium">Profit Margin:</span>{' '}
              <span className={getIndicator(fundamentals.profitMargin, v => v > 0.1, v => v < 0)}>
                {fundamentals.profitMargin ? (fundamentals.profitMargin * 100).toFixed(2) + '%' : 'N/A'}
              </span>
            </li>
            <li>
              <span className="font-medium">EPS:</span>{' '}
              <span className={INDICATOR_COLORS.neutral}>
                {fundamentals.eps ? fundamentals.eps.toFixed(2) : 'N/A'}
              </span>
            </li>
            <li>
              <span className="font-medium">Debt/Equity:</span>{' '}
              <span className={getIndicator(fundamentals.debtToEquity, v => v < 1, v => v > 2)}>
                {fundamentals.debtToEquity ? fundamentals.debtToEquity.toFixed(2) : 'N/A'}
              </span>
            </li>
          </ul>
        </div>
        {/* Analyst Consensus & News */}
        <div>
          <h3 className="font-semibold text-white mb-2 text-base sm:text-lg">Analyst & News</h3>
          <ul className="text-sm sm:text-base">
            <li>
              <span className="font-medium">Analyst Consensus:</span>{' '}
              {analyst ? (
                <span className={analyst.buy > analyst.sell ? INDICATOR_COLORS.good : analyst.sell > analyst.buy ? INDICATOR_COLORS.bad : INDICATOR_COLORS.neutral}>
                  {analyst.buy > analyst.sell ? 'Buy' : analyst.sell > analyst.buy ? 'Sell' : 'Hold'}
                </span>
              ) : (
                <span className={INDICATOR_COLORS.neutral}>N/A</span>
              )}
            </li>
            <li>
              <span className="font-medium">News Sentiment:</span>{' '}
              <span className={newsSentiment === 'positive' ? INDICATOR_COLORS.good : newsSentiment === 'negative' ? INDICATOR_COLORS.bad : INDICATOR_COLORS.neutral}>
                {newsSentiment.charAt(0).toUpperCase() + newsSentiment.slice(1)}
              </span>
            </li>
          </ul>
        </div>
      </div>
      {/* Performance */}
      <div className="mt-4 sm:mt-6">
        <h3 className="font-semibold text-white mb-2 text-base sm:text-lg">Recent Performance</h3>
        <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-sm sm:text-base">
          {['1M', '6M', '1Y'].map(label => (
            <li key={label}>
              <span className="font-medium">{label}:</span>{' '}
              <span className={getIndicator(performance[label], v => v > 0, v => v < 0)}>
                {performance[label] !== null && performance[label] !== undefined ? performance[label].toFixed(2) + '%' : 'N/A'}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* Pros & Cons */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h3 className="font-semibold text-green-400 mb-2 text-base sm:text-lg">Why Buy?</h3>
          <ul className="list-disc ml-6 text-green-300">
            {pros.length > 0 ? pros.map((pro, i) => <li key={i}>{pro}</li>) : <li>No major positives.</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-red-400 mb-2 text-base sm:text-lg">Why Avoid?</h3>
          <ul className="list-disc ml-6 text-red-300">
            {cons.length > 0 ? cons.map((con, i) => <li key={i}>{con}</li>) : <li>No major negatives.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StockScorecard; 