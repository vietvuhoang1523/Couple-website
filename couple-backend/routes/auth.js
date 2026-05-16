const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Couple  = require('../models/Couple');

// Tạo mã couple ngẫu nhiên 6 ký tự
function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// POST /api/auth/register
// Bước 1: Nam đăng ký trước → tự động tạo Couple + coupleCode
// Bước 2: Nữ đăng ký + nhập coupleCode → link vào couple
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      password,
      displayName,
      gender,
      avatar,
      coupleCode
    } = req.body;

    if (!username || !password || !displayName || !gender) {
      return res.status(400).json({
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({
        message: 'Tên đăng nhập đã tồn tại'
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    // tạo user trước
    const user = await User.create({
      username,
      password: hashed,
      displayName,
      gender,
      avatar
    });

    let couple;

    // ===== TRƯỜNG HỢP NHẬP MÃ COUPLE =====
    if (coupleCode) {
      couple = await Couple.findOne({
        coupleCode: coupleCode.toUpperCase()
      });

      if (!couple) {
        return res.status(404).json({
          message: 'Mã couple không tồn tại'
        });
      }

      // tránh ghi đè
      if (
        (gender === 'male' && couple.maleId) ||
        (gender === 'female' && couple.femaleId)
      ) {
        return res.status(400).json({
          message: 'Vai trò này đã có người'
        });
      }

      // gán người vào couple
      if (gender === 'male') {
        couple.maleId = user._id;
      } else {
        couple.femaleId = user._id;
      }

      await couple.save();
    }

    // ===== CHƯA CÓ MÃ => TẠO COUPLE MỚI =====
    else {
      let code = genCode();

      while (await Couple.findOne({ coupleCode: code })) {
        code = genCode();
      }

      couple = await Couple.create({
        maleId: gender === 'male' ? user._id : null,
        femaleId: gender === 'female' ? user._id : null,
        coupleCode: code
      });
    }

    // ===== LUÔN UPDATE coupleId =====
    user.coupleId = couple._id;
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        gender: user.gender,
        avatar: user.avatar,
        coupleId: user.coupleId,
        coupleCode: couple.coupleCode,
        coupled: !!(couple.maleId && couple.femaleId)
      }
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Lỗi server',
      error: err.message
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });

    // Lấy thêm thông tin couple
    let coupleInfo = null;
    if (user.coupleId) {
      coupleInfo = await Couple.findById(user.coupleId)
        .populate('maleId', 'displayName avatar')
        .populate('femaleId', 'displayName avatar');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        gender: user.gender,
        avatar: user.avatar,
        coupleId: user.coupleId,
      },
      couple: coupleInfo ? {
        id: coupleInfo._id,
        coupleName: coupleInfo.coupleName,
        since: coupleInfo.since,
        photo: coupleInfo.photo,
        coupleCode: coupleInfo.coupleCode,
        coupled: !!(coupleInfo.maleId && coupleInfo.femaleId),
        male:   coupleInfo.maleId   ? { name: coupleInfo.maleId.displayName,   avatar: coupleInfo.maleId.avatar }   : null,
        female: coupleInfo.femaleId ? { name: coupleInfo.femaleId.displayName, avatar: coupleInfo.femaleId.avatar } : null,
      } : null
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// PUT /api/auth/couple — cập nhật thông tin couple (tên, ngày yêu, ảnh)
const authMid = require('../middleware/auth');
router.put('/couple', authMid, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.coupleId) return res.status(404).json({ message: 'Chưa có couple' });

    const { coupleName, since, photo } = req.body;
    const couple = await Couple.findByIdAndUpdate(
      user.coupleId,
      { coupleName, since, photo },
      { new: true }
    );
    res.json(couple);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;