import app from './src/app.js';
import { connectDB, disconnectDB } from './src/config/db.js';
import { env } from './src/config/env.js';

/**
 * Start the HTTP server only after MongoDB is connected. This avoids accepting
 * requests that would immediately fail because the database is unavailable.
 */
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log('');
      console.log('==============================================');
      console.log(`  Social Media API (${env.nodeEnv})`);
      console.log(`  API:    http://localhost:${env.port}`);
      console.log(`  Health: http://localhost:${env.port}/api/health`);
      console.log(`  Docs:   http://localhost:${env.port}/api-docs`);
      console.log('==============================================');
      console.log('');
    });

    /**
     * Graceful shutdown: stop accepting new connections, then close MongoDB.
     */
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await disconnectDB();
        console.log('HTTP server and MongoDB connection closed.');
        process.exit(0);
      });

      // Force exit if shutdown takes too long.
      setTimeout(() => {
        console.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start the server:', error.message);
    process.exit(1);
  }
};

// Never let an unhandled rejection leave the process in an unknown state.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

startServer();
