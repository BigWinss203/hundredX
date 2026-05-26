const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get portfolio summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const portfolio = await query(
      'SELECT * FROM portfolios WHERE user_id = $1',
      [userId]
    );

    if (portfolio.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    res.json(portfolio.rows[0]);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get holdings
router.get('/holdings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        h.*,
        t.name,
        t.symbol,
        t.logo_uri,
        (h.amount * t.decimals) as display_amount
      FROM holdings h
      LEFT JOIN tokens t ON h.token_mint = t.mint_address
      WHERE h.user_id = $1
      ORDER BY h.updated_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get portfolio performance
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        DATE_TRUNC('day', t.created_at) as date,
        SUM(CASE WHEN t.trade_type = 'BUY' THEN t.total_value ELSE -t.total_value END) as portfolio_change,
        COUNT(*) as trade_count
      FROM trades t
      WHERE t.user_id = $1
      GROUP BY DATE_TRUNC('day', t.created_at)
      ORDER BY date DESC
      LIMIT 30
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching portfolio performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
