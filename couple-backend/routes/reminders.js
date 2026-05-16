const router   = require('express').Router();
const authMid  = require('../middleware/auth');
const Reminder = require('../models/Reminder');
const User     = require('../models/User');

router.use(authMid);

// GET /api/reminders
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.coupleId) return res.status(400).json({ message: 'Chưa link couple' });

    const reminders = await Reminder.find({ coupleId: user.coupleId })
      .populate('createdBy', 'displayName gender')
      .sort({ createdAt: -1 });

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reminders
router.post('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.coupleId) return res.status(400).json({ message: 'Chưa link couple' });

    const { text, targetWho, type } = req.body;
    if (!text) return res.status(400).json({ message: 'Thiếu nội dung' });

    const reminder = await Reminder.create({
      coupleId:  user.coupleId,
      createdBy: req.userId,
      text, targetWho, type
    });

    const populated = await reminder.populate('createdBy', 'displayName gender');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/reminders/:id — tick done
router.patch('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, coupleId: user.coupleId },
      req.body,
      { new: true }
    ).populate('createdBy', 'displayName gender');
    if (!reminder) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      coupleId: user.coupleId
    });
    if (!reminder) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ message: 'Đã xóa' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;