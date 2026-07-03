const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// API tìm kiếm full-text (case-insensitive)
router.get('/', async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) return res.json([]);

    const results = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    })
    .select('title content slug createdAt')
    .limit(10)
    .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;