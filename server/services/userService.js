const { getUserById } = require('./authService');

// In-memory stores (for development without a database)
const userPortfolios = new Map();
const userWatchlists = new Map();
const userAlerts = new Map();

/**
 * Get a user's portfolio.
 * @param {number} userId - The user's ID.
 * @returns {Array} The user's portfolio.
 */
const getPortfolio = async (userId) => {
  return userPortfolios.get(userId) || [];
};

/**
 * Add a stock to a user's portfolio.
 * @param {number} userId - The user's ID.
 * @param {object} stockData - The stock to add.
 * @returns {Array} The updated portfolio.
 */
const addToPortfolio = async (userId, stockData) => {
  const portfolio = userPortfolios.get(userId) || [];
  
  // Logic to add or update stock in portfolio
  const existingIndex = portfolio.findIndex(s => s.symbol === stockData.symbol);
  if (existingIndex > -1) {
    // Update existing stock
    portfolio[existingIndex] = { ...portfolio[existingIndex], ...stockData };
  } else {
    // Add new stock
    portfolio.push(stockData);
  }
  
  userPortfolios.set(userId, portfolio);
  return portfolio;
};

/**
 * Remove a stock from a user's portfolio.
 * @param {number} userId - The user's ID.
 * @param {string} symbol - The stock symbol to remove.
 * @returns {Array} The updated portfolio.
 */
const removeFromPortfolio = async (userId, symbol) => {
  let portfolio = userPortfolios.get(userId) || [];
  portfolio = portfolio.filter(s => s.symbol !== symbol);
  userPortfolios.set(userId, portfolio);
  return portfolio;
};

/**
 * Get a user's watchlist.
 * @param {number} userId - The user's ID.
 * @returns {Array} The user's watchlist.
 */
const getWatchlist = async (userId) => {
  return userWatchlists.get(userId) || [];
};

/**
 * Add a stock to a user's watchlist.
 * @param {number} userId - The user's ID.
 * @param {string} symbol - The stock symbol to add.
 * @returns {Array} The updated watchlist.
 */
const addToWatchlist = async (userId, symbol) => {
  const watchlist = userWatchlists.get(userId) || [];
  if (!watchlist.includes(symbol)) {
    watchlist.push(symbol);
    userWatchlists.set(userId, watchlist);
  }
  return watchlist;
};

/**
 * Remove a stock from a user's watchlist.
 * @param {number} userId - The user's ID.
 * @param {string} symbol - The stock symbol to remove.
 * @returns {Array} The updated watchlist.
 */
const removeFromWatchlist = async (userId, symbol) => {
  let watchlist = userWatchlists.get(userId) || [];
  watchlist = watchlist.filter(s => s !== symbol);
  userWatchlists.set(userId, watchlist);
  return watchlist;
};

/**
 * Get a user's price alerts.
 * @param {number} userId - The user's ID.
 * @returns {Array} The user's alerts.
 */
const getAlerts = async (userId) => {
    return userAlerts.get(userId) || [];
};

/**
 * Add a price alert for a user.
 * @param {number} userId - The user's ID.
 * @param {object} alertData - The alert to add.
 * @returns {Array} The updated alerts.
 */
const addAlert = async (userId, alertData) => {
    const alerts = userAlerts.get(userId) || [];
    alerts.push({ id: Date.now().toString(), ...alertData });
    userAlerts.set(userId, alerts);
    return alerts;
};

/**
 * Remove a price alert for a user.
 * @param {number} userId - The user's ID.
 * @param {string} alertId - The ID of the alert to remove.
 * @returns {Array} The updated alerts.
 */
const removeAlert = async (userId, alertId) => {
    let alerts = userAlerts.get(userId) || [];
    alerts = alerts.filter(a => a.id !== alertId);
    userAlerts.set(userId, alerts);
    return alerts;
};

module.exports = {
  getPortfolio,
  addToPortfolio,
  removeFromPortfolio,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getAlerts,
  addAlert,
  removeAlert,
  getUserById,
}; 