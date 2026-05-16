const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ===== ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/events', require('./routes/events'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/quotes', require('./routes/quotes'));

// ===== PORT =====
const PORT = process.env.PORT || 3000;

// ===== MONGODB =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Đã kết nối MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server chạy cổng ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  });