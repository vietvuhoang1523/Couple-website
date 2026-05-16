const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:    { type: String, required: true, unique: true, trim: true },
  password:    { type: String, required: true },
  displayName: { type: String, required: true }, // tên hiển thị: "Minh", "Linh"
  gender:      { type: String, enum: ['male', 'female'], required: true },
  avatar:      { type: String, default: '' },
  coupleId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);