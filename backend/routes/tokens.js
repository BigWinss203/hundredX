const express = require('express');
const { query } = require('../config/database');
const { getTokenPrice } = require('../config/solana');

const router = express.Router();

// Get trending tokens
router.get('/trending', async (req, res) => {
  try {
    const limit = req.query.limit || 20;

    const result = await query(`
      SELECT 
        t.mint_address,
        t.name,
        t.symbol,
        t.logo_uri,
        COUNT(tr.id) as trade_count,
        SUM(CASE WHEN tr.trade_type = 'BUY' THEN tr.total_value ELSE 0 END) as total_buy_volume
      FROM tokens t
      LEFT JOIN trades tr ON t.mint_address = tr.token_mint
      GROUP BY t.mint_address, t.name, t.symbol, t.logo_uri
      ORDER BY trade_count DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get token details
router.get('/:tokenMint', async (req, res) => {
  try {
    const { tokenMint } = req.params;

    const result = await query(`
      SELECT 
        t.*,
        COUNT(tr.id) as total_trades,
        COUNT(DISTINCT tr.user_id) as unique_traders
      FROM tokens t
      LEFT JOIN trades tr ON t.mint_address = tr.token_mint
      WHERE t.mint_address = $1
      GROUP BY t.mint_address, t.name, t.symbol, t.logo_uri, t.description, t.created_at, t.updated_at, t.decimals
    `, [tokenMint]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    // Get price from external source
    const price = await getTokenPrice(tokenMint);

    res.json({
      ...result.rows[0],
      current_price: price
    });
  } catch (error) {
    console.error('Error fetching token details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get token holders (top traders)
router.get('/:tokenMint/holders', async (req, res) => {
  try {
    const { tokenMint } = req.params;
    const limit = req.query.limit || 20;

    const result = await query(`
      SELECT 
        u.id,
        u.username,
        u.profile_picture,
        h.amount,
        h.average_buy_price,
        (h.amount * h.average_buy_price) as total_invested
      FROM holdings h
      INNER JOIN users u ON h.user_id = u.id
      WHERE h.token_mint = $1
      ORDER BY h.amount DESC
      LIMIT $2
    `, [tokenMint, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching token holders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search tokens
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = `%${req.params.query}%`;

    const result = await query(`
      SELECT 
        mint_address,
        name,
        symbol,
        logo_uri
      FROM tokens
      WHERE name ILIKE $1 OR symbol ILIKE $1
      LIMIT 20
    `, [searchQuery]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
