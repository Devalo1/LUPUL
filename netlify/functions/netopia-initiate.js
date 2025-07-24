// Export the fixed implementation for Netlify to invoke
const fixed = require('./netopia-initiate-fixed');
exports.handler = fixed.handler;
