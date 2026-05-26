const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hundredx_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        solana_wallet VARCHAR(255),
        profile_picture TEXT,
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS followers (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      );

      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        mint_address VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        decimals INTEGER,
        logo_uri TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_mint VARCHAR(255) REFERENCES tokens(mint_address),
        trade_type VARCHAR(10) NOT NULL,
        amount DECIMAL(20, 8) NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        total_value DECIMAL(20, 8) NOT NULL,
        transaction_hash VARCHAR(255),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS portfolios (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        total_value DECIMAL(20, 8) DEFAULT 0,
        total_invested DECIMAL(20, 8) DEFAULT 0,
        total_gains DECIMAL(20, 8) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS holdings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_mint VARCHAR(255) REFERENCES tokens(mint_address),
        amount DECIMAL(20, 8) NOT NULL,
        average_buy_price DECIMAL(20, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, token_mint)
      );

      CREATE TABLE IF NOT EXISTS price_alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_mint VARCHAR(255) REFERENCES tokens(mint_address),
        target_price DECIMAL(20, 8) NOT NULL,
        alert_type VARCHAR(20) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id);
      CREATE INDEX IF NOT EXISTS idx_trades_token ON trades(token_mint);
      CREATE INDEX IF NOT EXISTS idx_holdings_user ON holdings(user_id);
      CREATE INDEX IF NOT EXISTS idx_followers ON followers(follower_id, following_id);
    `);

    console.log('✅ Database tables initialized successfully');
    return pool;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
  initializeDatabase
};
