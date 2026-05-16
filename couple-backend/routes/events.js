const router  = require('express').Router();
const authMid = require('../middleware/auth');
const Event   = require('../models/Event');
const User    = require('../models/User');

router.use(authMid);

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.coupleId) return res.status(400).json({ message: 'Chưa link couple' });

    const events = await Event.find({ coupleId: user.coupleId })
      .populate('createdBy', 'displayName gender')
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events
router.post('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.coupleId) return res.status(400).json({ message: 'Chưa link couple' });

    const { name, date, type } = req.body;
    if (!name || !date) return res.status(400).json({ message: 'Thiếu thông tin' });

    const event = await Event.create({
      coupleId:  user.coupleId,
      createdBy: req.userId,
      name, date, type
    });

    const populated = await event.populate('createdBy', 'displayName gender');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      coupleId: user.coupleId
    });
    if (!event) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ message: 'Đã xóa' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;