const router     = require('express').Router();
const authMid    = require('../middleware/auth');
const Gallery    = require('../models/Gallery');
const User       = require('../models/User');
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;

router.use(authMid);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:    process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/gallery
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.coupleId) return res.status(400).json({ message: 'Chưa link couple' });

    const photos = await Gallery.find({ coupleId: user.coupleId })
      .populate('createdBy', 'displayName gender avatar')
      .sort({ createdAt: -1 });

    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/gallery/upload — upload file ảnh thật lên Cloudinary
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.coupleId) return res.status(400).json({ message: 'Chưa link couple' });
    if (!req.file) return res.status(400).json({ message: 'Không có file' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'coupleapp' },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(req.file.buffer);
    });

    const photo = await Gallery.create({
      coupleId:  user.coupleId,
      createdBy: req.userId,
      url:       result.secure_url,
      caption:   req.body.caption || '',
    });

    const populated = await photo.populate('createdBy', 'displayName gender avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/gallery/url — thêm ảnh bằng URL
router.post('/url', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.coupleId) return res.status(400).json({ message: 'Chưa link couple' });

    const { url, caption } = req.body;
    if (!url) return res.status(400).json({ message: 'Thiếu URL' });

    const photo = await Gallery.create({
      coupleId:  user.coupleId,
      createdBy: req.userId,
      url, caption
    });

    const populated = await photo.populate('createdBy', 'displayName gender avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const photo = await Gallery.findOneAndDelete({
      _id: req.params.id,
      coupleId: user.coupleId
    });
    if (!photo) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ message: 'Đã xóa' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;