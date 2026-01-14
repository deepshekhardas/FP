const { createClient } = require('redis');

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection
 * Gracefully handles missing Redis server (falls back to no-cache mode)
 */
const initRedis = async () => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
        redisClient = createClient({ url: redisUrl });

        redisClient.on('error', (err) => {
            console.warn('⚠️ Redis connection error:', err.message);
            isConnected = false;
        });

        redisClient.on('connect', () => {
            console.log('✅ Redis connected');
            isConnected = true;
        });

        redisClient.on('disconnect', () => {
            console.log('🔌 Redis disconnected');
            isConnected = false;
        });

        await redisClient.connect();
    } catch (error) {
        console.warn('⚠️ Redis not available. Running without cache:', error.message);
        isConnected = false;
    }
};

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {any|null} - Parsed value or null if not found
 */
const getCache = async (key) => {
    if (!isConnected || !redisClient) return null;

    try {
        const value = await redisClient.get(key);
        if (value) {
            console.log(`🎯 Cache HIT: ${key}`);
            return JSON.parse(value);
        }
        console.log(`❌ Cache MISS: ${key}`);
        return null;
    } catch (error) {
        console.warn('Redis get error:', error.message);
        return null;
    }
};

/**
 * Set cached value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
const setCache = async (key, value, ttl = 300) => {
    if (!isConnected || !redisClient) return;

    try {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
        console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
        console.warn('Redis set error:', error.message);
    }
};

/**
 * Delete cached value
 * @param {string} key - Cache key or pattern
 */
const deleteCache = async (key) => {
    if (!isConnected || !redisClient) return;

    try {
        await redisClient.del(key);
        console.log(`🗑️ Cache DELETE: ${key}`);
    } catch (error) {
        console.warn('Redis delete error:', error.message);
    }
};

/**
 * Clear cache by pattern (useful for invalidating related caches)
 * @param {string} pattern - Pattern like "exercises:*"
 */
const clearCachePattern = async (pattern) => {
    if (!isConnected || !redisClient) return;

    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`🗑️ Cache CLEAR: ${keys.length} keys matching ${pattern}`);
        }
    } catch (error) {
        console.warn('Redis clear pattern error:', error.message);
    }
};

module.exports = {
    initRedis,
    getCache,
    setCache,
    deleteCache,
    clearCachePattern
};
