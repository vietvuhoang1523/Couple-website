const mongoose = require('mongoose');

const coupleSchema = new mongoose.Schema({
  maleId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  femaleId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  coupleName:  { type: String, default: '' },      // vd: "Minh & Linh"
  since:       { type: String, default: '' },      // ngày yêu nhau YYYY-MM-DD
  photo:       { type: String, default: '' },      // ảnh chung của cặp đôi
  coupleCode:  { type: String, unique: true },     // mã 6 ký tự để link 2 tài khoản
}, { timestamps: true });

module.exports = mongoose.model('Couple', coupleSchema);