const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await query(
      'SELECT id, username, profile_picture, bio, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Get follower count
    const followers = await query(
      'SELECT COUNT(*) FROM followers WHERE following_id = $1',
      [userId]
    );

    // Get following count
    const following = await query(
      'SELECT COUNT(*) FROM followers WHERE follower_id = $1',
      [userId]
    );

    res.json({
      ...user,
      followers_count: parseInt(followers.rows[0].count),
      following_count: parseInt(following.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile/update', authenticateToken, async (req, res) => {
  try {
    const { bio, profile_picture, solana_wallet } = req.body;
    const userId = req.user.id;

    const result = await query(
      'UPDATE users SET bio = COALESCE($1, bio), profile_picture = COALESCE($2, profile_picture), solana_wallet = COALESCE($3, solana_wallet), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, username, email, bio, profile_picture, solana_wallet',
      [bio, profile_picture, solana_wallet, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leaderboard (top traders)
router.get('/leaderboard/top', async (req, res) => {
  try {
    const limit = req.query.limit || 100;

    const result = await query(`
      SELECT 
        u.id,
        u.username,
        u.profile_picture,
        p.total_gains,
        p.total_value,
        COUNT(DISTINCT t.id) as trade_count
      FROM users u
      LEFT JOIN portfolios p ON u.id = p.user_id
      LEFT JOIN trades t ON u.id = t.user_id
      GROUP BY u.id, u.username, u.profile_picture, p.total_gains, p.total_value
      ORDER BY p.total_gains DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's recent trades
router.get('/:userId/trades', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit || 20;

    const result = await query(`
      SELECT 
        t.id,
        t.token_mint,
        t.trade_type,
        t.amount,
        t.price,
        t.total_value,
        t.created_at,
        tok.name,
        tok.symbol
      FROM trades t
      LEFT JOIN tokens tok ON t.token_mint = tok.mint_address
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2
    `, [userId, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
