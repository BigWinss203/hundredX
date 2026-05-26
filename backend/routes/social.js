const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Follow user
router.post('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const followingId = req.params.userId;
    const followerId = req.user.id;

    if (parseInt(followerId) === parseInt(followingId)) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userExists = await query('SELECT * FROM users WHERE id = $1', [followingId]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const alreadyFollowing = await query(
      'SELECT * FROM followers WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    if (alreadyFollowing.rows.length > 0) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add follower
    await query(
      'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)',
      [followerId, followingId]
    );

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unfollow user
router.post('/unfollow/:userId', authenticateToken, async (req, res) => {
  try {
    const followingId = req.params.userId;
    const followerId = req.user.id;

    await query(
      'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get followers
router.get('/:userId/followers', async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = req.query.limit || 50;

    const result = await query(`
      SELECT 
        u.id,
        u.username,
        u.profile_picture
      FROM users u
      INNER JOIN followers f ON u.id = f.follower_id
      WHERE f.following_id = $1
      LIMIT $2
    `, [userId, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get following
router.get('/:userId/following', async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = req.query.limit || 50;

    const result = await query(`
      SELECT 
        u.id,
        u.username,
        u.profile_picture
      FROM users u
      INNER JOIN followers f ON u.id = f.following_id
      WHERE f.follower_id = $1
      LIMIT $2
    `, [userId, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get social feed (trades from followed users)
router.get('/feed/trades', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit || 50;

    const result = await query(`
      SELECT 
        t.id,
        t.user_id,
        u.username,
        u.profile_picture,
        t.token_mint,
        t.trade_type,
        t.amount,
        t.price,
        t.total_value,
        t.created_at,
        tok.name,
        tok.symbol,
        tok.logo_uri
      FROM trades t
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN tokens tok ON t.token_mint = tok.mint_address
      INNER JOIN followers f ON t.user_id = f.following_id
      WHERE f.follower_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2
    `, [userId, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if following
router.get('/check/:userId', authenticateToken, async (req, res) => {
  try {
    const followingId = req.params.userId;
    const followerId = req.user.id;

    const result = await query(
      'SELECT * FROM followers WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    res.json({ isFollowing: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
