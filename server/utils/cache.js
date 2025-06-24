const NodeCache = require('node-cache');

// Standard cache with a default TTL (e.g., 5 minutes)
const standardCache = new NodeCache({ 
  stdTTL: process.env.CACHE_TTL || 300, 
  checkperiod: process.env.CACHE_CHECK_PERIOD || 600 
});

// Long-term cache for data that changes infrequently (e.g., 1 day)
const longTermCache = new NodeCache({ stdTTL: 86400, checkperiod: 10800 });

/**
 * Get a value from the specified cache.
 * @param {string} key - The key to retrieve from the cache.
 * @param {string} [cacheType='standard'] - The type of cache ('standard' or 'long-term').
 * @returns {any} The cached value, or undefined if not found.
 */
const getCache = (key, cacheType = 'standard') => {
  const cache = cacheType === 'long-term' ? longTermCache : standardCache;
  const value = cache.get(key);
  if (value) {
    console.log(`CACHE HIT: Key "${key}" found in ${cacheType} cache.`);
  } else {
    console.log(`CACHE MISS: Key "${key}" not found in ${cacheType} cache.`);
  }
  return value;
};

/**
 * Set a value in the specified cache.
 * @param {string} key - The key to set in the cache.
 * @param {any} value - The value to cache.
 * @param {string} [cacheType='standard'] - The type of cache ('standard' or 'long-term').
 * @param {number} [ttl] - Optional time-to-live in seconds.
 * @returns {boolean} True if the item was successfully set.
 */
const setCache = (key, value, cacheType = 'standard', ttl) => {
  const cache = cacheType === 'long-term' ? longTermCache : standardCache;
  console.log(`CACHE SET: Setting key "${key}" in ${cacheType} cache.`);
  if (ttl) {
    return cache.set(key, value, ttl);
  }
  return cache.set(key, value);
};

/**
 * Delete a key from the specified cache.
 * @param {string} key - The key to delete.
 * @param {string} [cacheType='standard'] - The type of cache.
 */
const delCache = (key, cacheType = 'standard') => {
  const cache = cacheType === 'long-term' ? longTermCache : standardCache;
  console.log(`CACHE DEL: Deleting key "${key}" from ${cacheType} cache.`);
  cache.del(key);
};

/**
 * Flush all items from the specified cache.
 * @param {string} [cacheType='standard'] - The type of cache.
 */
const flushCache = (cacheType = 'standard') => {
  const cache = cacheType === 'long-term' ? longTermCache : standardCache;
  console.log(`CACHE FLUSH: Flushing all keys from ${cacheType} cache.`);
  cache.flushAll();
};

/**
 * Get stats for the specified cache.
 * @param {string} [cacheType='standard'] - The type of cache.
 * @returns {object} The cache statistics.
 */
const getCacheStats = (cacheType = 'standard') => {
  const cache = cacheType === 'long-term' ? longTermCache : standardCache;
  return cache.getStats();
};

module.exports = {
  getCache,
  setCache,
  delCache,
  flushCache,
  getCacheStats,
  standardCache,
  longTermCache,
}; 