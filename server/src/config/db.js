import mongoose from 'mongoose';

let listenersAttached = false;

/**
 * Register Mongoose connection lifecycle listeners.
 * Guarded to ensure listeners are registered only once across app lifecycle.
 */
const attachConnectionListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Lifecycle Event: connected (${mongoose.connection.host}/${mongoose.connection.name})`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Lifecycle Event: error - ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Lifecycle Event: disconnected from database.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Lifecycle Event: reconnected successfully.');
  });
};

/**
 * Connect to MongoDB Atlas (or local fallback URI if not configured)
 * Preserves existing URI configuration and applies resilient pool/timeout settings.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shaadivibe';
  attachConnectionListeners();

  // If already connected, reuse active connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    console.warn('[MongoDB] Note: Server is running with limited database availability.');
    return null;
  }
};

/**
 * Reusable database health status utility
 */
export const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Structured connection status (without exposing credentials or connection strings)
 */
export const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const readyState = mongoose.connection.readyState;
  return {
    isConnected: readyState === 1,
    state: states[readyState] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

/**
 * Graceful database disconnect utility
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(false);
  }
};
