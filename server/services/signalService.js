const { getStockData, getHistoricalData } = require('./stockService');
const { EMA, MACD, RSI, WilliamsR, Stochastic } = require('technicalindicators');
const { getCache, setCache } = require('../utils/cache');
const Regression = require('ml-regression');
const LinearRegression = require('ml-regression').LinearRegression;

// Generate AI trading signals for a stock
async function generateSignals(symbol, timeframe = '1d') {
  try {
    // Get historical data
    const historicalData = await getHistoricalData(symbol, '1y', '1d');
    const data = historicalData.data;
    
    if (data.length < 50) {
      throw new Error('Insufficient data for analysis');
    }

    // Calculate technical indicators
    const indicators = calculateAdvancedIndicators(data);
    
    // Generate signals based on multiple factors
    const signals = analyzeSignals(indicators, data);
    
    // Add sentiment analysis
    const sentiment = await analyzeSentiment(symbol);
    
    // Add risk assessment
    const risk = calculateRiskAssessment(data, indicators);
    
    // Combine all analysis
    const finalSignal = combineSignals(signals, sentiment, risk);
    
    return {
      symbol,
      timestamp: new Date().toISOString(),
      signal: finalSignal.recommendation,
      confidence: finalSignal.confidence,
      reasoning: finalSignal.reasoning,
      indicators: indicators,
      sentiment: sentiment,
      risk: risk,
      priceTargets: finalSignal.priceTargets,
      stopLoss: finalSignal.stopLoss
    };
  } catch (error) {
    console.error(`Error generating signals for ${symbol}:`, error.message);
    throw error;
  }
}

// Calculate advanced technical indicators
function calculateAdvancedIndicators(data) {
  const closes = data.map(d => d.close);
  const volumes = data.map(d => d.volume);
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);

  // Moving Averages
  const sma20 = EMA.calculate({ period: 20, values: closes });
  const sma50 = EMA.calculate({ period: 50, values: closes });
  const sma200 = EMA.calculate({ period: 200, values: closes });

  // RSI
  const rsi = RSI.calculate({ period: 14, values: closes });

  // MACD
  const macd = MACD.calculate({
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    values: closes
  });

  // Stochastic
  const stoch = Stochastic.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14,
    signalPeriod: 3
  });

  // Volume analysis
  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const currentVolume = volumes[volumes.length - 1];
  const volumeRatio = currentVolume / avgVolume;

  // Price momentum
  const momentum = (closes[closes.length - 1] - closes[closes.length - 10]) / closes[closes.length - 10] * 100;

  return {
    sma20: sma20[sma20.length - 1] || null,
    sma50: sma50[sma50.length - 1] || null,
    sma200: sma200[sma200.length - 1] || null,
    rsi: rsi[rsi.length - 1] || null,
    macd: macd[macd.length - 1] || null,
    stochastic: stoch[stoch.length - 1] || null,
    volumeRatio,
    momentum,
    currentPrice: closes[closes.length - 1]
  };
}

// Analyze signals based on technical indicators
function analyzeSignals(indicators, data) {
  const signals = [];
  let bullishCount = 0;
  let bearishCount = 0;

  // RSI Analysis
  if (indicators.rsi < 30) {
    signals.push({ type: 'bullish', strength: 'strong', reason: 'RSI oversold (< 30)' });
    bullishCount += 2;
  } else if (indicators.rsi > 70) {
    signals.push({ type: 'bearish', strength: 'strong', reason: 'RSI overbought (> 70)' });
    bearishCount += 2;
  }

  // Moving Average Analysis
  if (indicators.sma20 > indicators.sma50 && indicators.sma50 > indicators.sma200) {
    signals.push({ type: 'bullish', strength: 'medium', reason: 'Golden Cross (SMA20 > SMA50 > SMA200)' });
    bullishCount += 1;
  } else if (indicators.sma20 < indicators.sma50 && indicators.sma50 < indicators.sma200) {
    signals.push({ type: 'bearish', strength: 'medium', reason: 'Death Cross (SMA20 < SMA50 < SMA200)' });
    bearishCount += 1;
  }

  // MACD Analysis
  if (indicators.macd && indicators.macd.MACD > indicators.macd.signal) {
    signals.push({ type: 'bullish', strength: 'medium', reason: 'MACD above signal line' });
    bullishCount += 1;
  } else if (indicators.macd && indicators.macd.MACD < indicators.macd.signal) {
    signals.push({ type: 'bearish', strength: 'medium', reason: 'MACD below signal line' });
    bearishCount += 1;
  }

  // Volume Analysis
  if (indicators.volumeRatio > 1.5) {
    signals.push({ type: 'bullish', strength: 'weak', reason: 'High volume spike' });
    bullishCount += 0.5;
  }

  // Momentum Analysis
  if (indicators.momentum > 5) {
    signals.push({ type: 'bullish', strength: 'weak', reason: 'Positive momentum' });
    bullishCount += 0.5;
  } else if (indicators.momentum < -5) {
    signals.push({ type: 'bearish', strength: 'weak', reason: 'Negative momentum' });
    bearishCount += 0.5;
  }

  return {
    signals,
    bullishCount,
    bearishCount,
    netSignal: bullishCount - bearishCount
  };
}

// Analyze market sentiment
async function analyzeSentiment(symbol) {
  try {
    // This would integrate with news APIs and social media sentiment
    // For now, return a placeholder sentiment analysis
    return {
      score: Math.random() * 2 - 1, // -1 to 1
      label: Math.random() > 0.5 ? 'positive' : 'negative',
      confidence: Math.random() * 0.5 + 0.5,
      sources: ['news', 'social_media'],
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      score: 0,
      label: 'neutral',
      confidence: 0,
      sources: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

// Calculate risk assessment
function calculateRiskAssessment(data, indicators) {
  const closes = data.map(d => d.close);
  const volumes = data.map(d => d.volume);
  
  // Calculate volatility (standard deviation of returns)
  const returns = [];
  for (let i = 1; i < closes.length; i++) {
    returns.push((closes[i] - closes[i-1]) / closes[i-1]);
  }
  
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
  
  // Calculate beta (market correlation)
  const beta = calculateBeta(data);
  
  // Calculate Sharpe ratio
  const riskFreeRate = 0.02; // 2% annual risk-free rate
  const sharpeRatio = (meanReturn * 252 - riskFreeRate) / volatility;
  
  return {
    volatility: volatility * 100, // Convert to percentage
    beta,
    sharpeRatio,
    riskLevel: getRiskLevel(volatility, beta),
    maxDrawdown: calculateMaxDrawdown(closes)
  };
}

// Calculate beta (simplified)
function calculateBeta(data) {
  // This is a simplified beta calculation
  // In a real implementation, you'd compare against a market index
  return 1.0 + (Math.random() - 0.5) * 0.5; // Random beta between 0.75 and 1.25
}

// Get risk level based on volatility and beta
function getRiskLevel(volatility, beta) {
  const riskScore = volatility * beta;
  
  if (riskScore < 0.15) return 'low';
  if (riskScore < 0.25) return 'medium';
  return 'high';
}

// Calculate maximum drawdown
function calculateMaxDrawdown(prices) {
  let maxDrawdown = 0;
  let peak = prices[0];
  
  for (let price of prices) {
    if (price > peak) {
      peak = price;
    }
    const drawdown = (peak - price) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown * 100; // Convert to percentage
}

// Combine all signals into final recommendation
function combineSignals(signals, sentiment, risk) {
  const { bullishCount, bearishCount, netSignal } = signals;
  
  // Base signal from technical analysis
  let recommendation = 'hold';
  let confidence = 0.5;
  
  if (netSignal > 2) {
    recommendation = 'buy';
    confidence = Math.min(0.9, 0.5 + netSignal * 0.1);
  } else if (netSignal < -2) {
    recommendation = 'sell';
    confidence = Math.min(0.9, 0.5 + Math.abs(netSignal) * 0.1);
  }
  
  // Adjust based on sentiment
  if (sentiment.label === 'positive' && recommendation === 'buy') {
    confidence += 0.1;
  } else if (sentiment.label === 'negative' && recommendation === 'sell') {
    confidence += 0.1;
  }
  
  // Adjust based on risk
  if (risk.riskLevel === 'high' && recommendation === 'buy') {
    confidence -= 0.1;
  }
  
  // Calculate price targets
  const priceTargets = calculatePriceTargets(signals, risk);
  
  return {
    recommendation,
    confidence: Math.max(0.1, Math.min(0.95, confidence)),
    reasoning: signals.signals.map(s => s.reason).join('; '),
    priceTargets,
    stopLoss: priceTargets.stopLoss
  };
}

// Calculate price targets
function calculatePriceTargets(signals, risk) {
  const currentPrice = 100; // This would be the actual current price
  
  // Calculate targets based on volatility and signal strength
  const volatilityMultiplier = risk.volatility / 100;
  const signalStrength = Math.abs(signals.netSignal) / 5;
  
  const targetRange = currentPrice * volatilityMultiplier * signalStrength;
  
  return {
    conservative: currentPrice + (targetRange * 0.5),
    moderate: currentPrice + targetRange,
    aggressive: currentPrice + (targetRange * 1.5),
    stopLoss: currentPrice - (targetRange * 0.7)
  };
}

// Analyze portfolio
async function analyzePortfolio(stocks, riskTolerance = 'medium') {
  try {
    const portfolioAnalysis = [];
    
    for (const stock of stocks) {
      const signals = await generateSignals(stock.symbol);
      portfolioAnalysis.push({
        symbol: stock.symbol,
        signals: signals,
        allocation: stock.allocation || 0
      });
    }
    
    // Calculate portfolio-level metrics
    const portfolioRisk = calculatePortfolioRisk(portfolioAnalysis);
    const rebalancingRecommendations = generateRebalancingRecommendations(portfolioAnalysis, riskTolerance);
    
    return {
      stocks: portfolioAnalysis,
      portfolioRisk,
      rebalancingRecommendations,
      overallRecommendation: getPortfolioRecommendation(portfolioAnalysis)
    };
  } catch (error) {
    console.error('Error analyzing portfolio:', error);
    throw error;
  }
}

// Calculate portfolio risk
function calculatePortfolioRisk(portfolioAnalysis) {
  // Simplified portfolio risk calculation
  const totalRisk = portfolioAnalysis.reduce((sum, stock) => {
    return sum + (stock.signals.risk.volatility * (stock.allocation / 100));
  }, 0);
  
  return {
    totalRisk: totalRisk,
    riskLevel: totalRisk < 15 ? 'low' : totalRisk < 25 ? 'medium' : 'high',
    diversificationScore: calculateDiversificationScore(portfolioAnalysis)
  };
}

// Calculate diversification score
function calculateDiversificationScore(portfolioAnalysis) {
  const stockCount = portfolioAnalysis.length;
  const maxAllocation = Math.max(...portfolioAnalysis.map(s => s.allocation));
  
  // Higher score for more stocks and more even distribution
  return Math.min(1, (stockCount / 10) * (1 - maxAllocation / 100));
}

// Generate rebalancing recommendations
function generateRebalancingRecommendations(portfolioAnalysis, riskTolerance) {
  const recommendations = [];
  
  for (const stock of portfolioAnalysis) {
    if (stock.signals.signal === 'sell' && stock.allocation > 20) {
      recommendations.push({
        symbol: stock.symbol,
        action: 'reduce',
        reason: 'Strong sell signal',
        suggestedAllocation: Math.max(5, stock.allocation * 0.7)
      });
    } else if (stock.signals.signal === 'buy' && stock.allocation < 10) {
      recommendations.push({
        symbol: stock.symbol,
        action: 'increase',
        reason: 'Strong buy signal',
        suggestedAllocation: Math.min(25, stock.allocation * 1.5)
      });
    }
  }
  
  return recommendations;
}

// Get portfolio recommendation
function getPortfolioRecommendation(portfolioAnalysis) {
  const buySignals = portfolioAnalysis.filter(s => s.signals.signal === 'buy').length;
  const sellSignals = portfolioAnalysis.filter(s => s.signals.signal === 'sell').length;
  
  if (buySignals > sellSignals * 2) {
    return 'bullish';
  } else if (sellSignals > buySignals * 2) {
    return 'bearish';
  } else {
    return 'neutral';
  }
}

// Get signal history
async function getSignalHistory(symbol, days = 30) {
  try {
    // This would fetch historical signals from a database
    // For now, return mock data
    const history = [];
    const currentDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      history.push({
        date: date.toISOString(),
        signal: ['buy', 'sell', 'hold'][Math.floor(Math.random() * 3)],
        confidence: Math.random() * 0.5 + 0.5,
        price: 100 + (Math.random() - 0.5) * 20
      });
    }
    
    return history.reverse();
  } catch (error) {
    console.error('Error fetching signal history:', error);
    throw error;
  }
}

module.exports = {
  generateSignals,
  analyzePortfolio,
  getSignalHistory
}; 