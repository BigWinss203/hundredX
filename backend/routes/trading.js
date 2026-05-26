const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('./auth');
const { getTokenPrice } = require('../config/solana');

const router = express.Router();

// Create buy trade
router.post('/buy', authenticateToken, async (req, res) => {
  try {
    const { token_mint, amount, price } = req.body;
    const userId = req.user.id;

    if (!token_mint || !amount || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const total_value = amount * price;

    // Check if token exists, if not create it
    const tokenExists = await query('SELECT * FROM tokens WHERE mint_address = $1', [token_mint]);
    if (tokenExists.rows.length === 0) {
      await query(
        'INSERT INTO tokens (mint_address, name, symbol, decimals) VALUES ($1, $2, $3, $4)',
        [token_mint, 'Unknown Token', 'UNKNOWN', 6]
      );
    }

    // Create trade record
    const tradeResult = await query(
      'INSERT INTO trades (user_id, token_mint, trade_type, amount, price, total_value, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, token_mint, 'BUY', amount, price, total_value, 'COMPLETED']
    );

    // Update or create holding
    const holdingExists = await query(
      'SELECT * FROM holdings WHERE user_id = $1 AND token_mint = $2',
      [userId, token_mint]
    );

    if (holdingExists.rows.length > 0) {
      const holding = holdingExists.rows[0];
      const newAmount = parseFloat(holding.amount) + parseFloat(amount);
      const newAvgPrice = (parseFloat(holding.average_buy_price) * parseFloat(holding.amount) + parseFloat(price) * parseFloat(amount)) / newAmount;

      await query(
        'UPDATE holdings SET amount = $1, average_buy_price = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND token_mint = $4',
        [newAmount, newAvgPrice, userId, token_mint]
      );
    } else {
      await query(
        'INSERT INTO holdings (user_id, token_mint, amount, average_buy_price) VALUES ($1, $2, $3, $4)',
        [userId, token_mint, amount, price]
      );
    }

    // Update portfolio
    await query(
      'UPDATE portfolios SET total_invested = total_invested + $1, total_value = total_value + $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3',
      [total_value, total_value, userId]
    );

    res.status(201).json({
      message: 'Trade created successfully',
      trade: tradeResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating buy trade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create sell trade
router.post('/sell', authenticateToken, async (req, res) => {
  try {
    const { token_mint, amount, price } = req.body;
    const userId = req.user.id;

    if (!token_mint || !amount || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const total_value = amount * price;

    // Check if user has enough holding
    const holding = await query(
      'SELECT * FROM holdings WHERE user_id = $1 AND token_mint = $2',
      [userId, token_mint]
    );

    if (holding.rows.length === 0 || parseFloat(holding.rows[0].amount) < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient holding amount' });
    }

    // Create trade record
    const tradeResult = await query(
      'INSERT INTO trades (user_id, token_mint, trade_type, amount, price, total_value, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, token_mint, 'SELL', amount, price, total_value, 'COMPLETED']
    );

    // Update holding
    const newAmount = parseFloat(holding.rows[0].amount) - parseFloat(amount);

    if (newAmount === 0) {
      await query('DELETE FROM holdings WHERE user_id = $1 AND token_mint = $2', [userId, token_mint]);
    } else {
      await query(
        'UPDATE holdings SET amount = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND token_mint = $3',
        [newAmount, userId, token_mint]
      );
    }

    // Update portfolio
    const gain = total_value - (parseFloat(holding.rows[0].average_buy_price) * parseFloat(amount));
    await query(
      'UPDATE portfolios SET total_value = total_value - $1, total_gains = total_gains + $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3',
      [total_value, gain, userId]
    );

    res.status(201).json({
      message: 'Sell trade created successfully',
      trade: tradeResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating sell trade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get trade history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit || 50;

    const result = await query(`
      SELECT 
        t.*,
        tok.name,
        tok.symbol,
        tok.logo_uri
      FROM trades t
      LEFT JOIN tokens tok ON t.token_mint = tok.mint_address
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2
    `, [userId, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trade history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
