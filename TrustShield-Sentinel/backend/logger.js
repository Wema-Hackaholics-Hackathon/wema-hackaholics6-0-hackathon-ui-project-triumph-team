let logger;
try {
  const pino = require('pino');
  logger = pino({ level: process.env.LOG_LEVEL || 'info' });
} catch (err) {
  logger = {
    info: (...args) => console.log(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
    debug: (...args) => console.debug(...args),
  };
}

module.exports = logger;
