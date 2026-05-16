const router  = require('express').Router();
const authMid = require('../middleware/auth');
const Quote   = require('../models/quote');
const User    = require('../models/User');

router.use(authMid);

// GET /api/quotes — lấy tất cả quote của couple
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.coupleId) return res.status(400).json({ message: 'Chưa link couple' });

    const quotes = await Quote.find({ coupleId: user.coupleId })
      .populate('createdBy', 'displayName gender avatar')
      .sort({ createdAt: -1 });

    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/quotes — viết quote mới
router.post('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.coupleId) return res.status(400).json({ message: 'Chưa link couple' });

    const { content, mood } = req.body;
    if (!content) return res.status(400).json({ message: 'Thiếu nội dung' });

    const quote = await Quote.create({
      coupleId:  user.coupleId,
      createdBy: req.userId,
      content, mood
    });

    const populated = await quote.populate('createdBy', 'displayName gender avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/quotes/:id — chỉ người tạo mới xóa được
router.delete('/:id', async (req, res) => {
  try {
    const quote = await Quote.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId
    });
    if (!quote) return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền xóa' });
    res.json({ message: 'Đã xóa' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;