const { body, param, query, validationResult } = require('express-validator');

// Validation rules
const validateSymbol = [
  param('symbol')
    .trim()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z]{1,10}$/)
    .withMessage('Symbol must be 1-10 uppercase letters')
];

const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required (max 50 characters)'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required (max 50 characters)')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validatePortfolioEntry = [
  body('symbol')
    .trim()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z]{1,10}$/)
    .withMessage('Valid symbol is required'),
  body('shares')
    .isFloat({ min: 0.01 })
    .withMessage('Shares must be a positive number'),
  body('avgPrice')
    .isFloat({ min: 0.01 })
    .withMessage('Average price must be a positive number'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date')
];

const validateWatchlistEntry = [
  body('symbol')
    .trim()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z]{1,10}$/)
    .withMessage('Valid symbol is required'),
  body('alertPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Alert price must be a positive number')
];

const validateStockSearch = [
  query('query')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query is required (max 100 characters)')
];

const validateTimeframe = [
  query('timeframe')
    .optional()
    .isIn(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd'])
    .withMessage('Invalid timeframe')
];

const validatePeriod = [
  query('period')
    .optional()
    .isIn(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd'])
    .withMessage('Invalid period')
];

const validateInterval = [
  query('interval')
    .optional()
    .isIn(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'])
    .withMessage('Invalid interval')
];

const validateLimit = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateOffset = [
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

const validateRiskTolerance = [
  body('riskTolerance')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Risk tolerance must be low, medium, or high')
];

const validateAnalysisType = [
  body('analysisType')
    .optional()
    .isIn(['technical', 'fundamental', 'sentiment', 'combined'])
    .withMessage('Analysis type must be technical, fundamental, sentiment, or combined')
];

// Custom validation functions
const validateStockSymbol = (value) => {
  if (!/^[A-Z]{1,10}$/.test(value)) {
    throw new Error('Invalid stock symbol format');
  }
  return true;
};

const validatePrice = (value) => {
  if (isNaN(value) || parseFloat(value) <= 0) {
    throw new Error('Price must be a positive number');
  }
  return true;
};

const validateShares = (value) => {
  if (isNaN(value) || parseFloat(value) <= 0) {
    throw new Error('Shares must be a positive number');
  }
  return true;
};

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Sanitization functions
const sanitizeSymbol = (symbol) => {
  return symbol.trim().toUpperCase();
};

const sanitizeEmail = (email) => {
  return email.trim().toLowerCase();
};

const sanitizeString = (str) => {
  return str.trim();
};

// Rate limiting validation
const validateRateLimit = (req, res, next) => {
  // This would integrate with a rate limiting library like express-rate-limit
  // For now, just pass through
  next();
};

// API key validation (for external APIs)
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is required'
    });
  }
  
  // In production, validate against stored API keys
  if (apiKey.length < 10) {
    return res.status(401).json({
      error: 'Invalid API key'
    });
  }
  
  next();
};

// Date range validation
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  (req, res, next) => {
    const { startDate, endDate } = req.query;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return res.status(400).json({
          error: 'Start date must be before end date'
        });
      }
      
      const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        return res.status(400).json({
          error: 'Date range cannot exceed 1 year'
        });
      }
    }
    
    next();
  }
];

// Portfolio validation
const validatePortfolio = [
  body('stocks')
    .isArray({ min: 1, max: 100 })
    .withMessage('Portfolio must contain 1-100 stocks'),
  body('stocks.*.symbol')
    .trim()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z]{1,10}$/)
    .withMessage('Each stock must have a valid symbol'),
  body('stocks.*.allocation')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Allocation must be between 0 and 100')
];

// Export all validation functions
module.exports = {
  validateSymbol,
  validateRegistration,
  validateLogin,
  validatePortfolioEntry,
  validateWatchlistEntry,
  validateStockSearch,
  validateTimeframe,
  validatePeriod,
  validateInterval,
  validateLimit,
  validateOffset,
  validateRiskTolerance,
  validateAnalysisType,
  validateDateRange,
  validatePortfolio,
  handleValidationErrors,
  validateRateLimit,
  validateApiKey,
  sanitizeSymbol,
  sanitizeEmail,
  sanitizeString,
  validateStockSymbol,
  validatePrice,
  validateShares
}; 