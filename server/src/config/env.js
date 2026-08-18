require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: requireEnv('MONGODB_URI'),
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME || 'IMO Craft Admin',
  },
  payment: {
    gateway: process.env.PAYMENT_GATEWAY || 'none',
    apiKey: process.env.PAYMENT_GATEWAY_API_KEY,
    secret: process.env.PAYMENT_GATEWAY_SECRET,
    merchantId: process.env.PAYMENT_GATEWAY_MERCHANT_ID,
    webhookSecret: process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET,
  },
};
