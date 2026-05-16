const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  coupleId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ai viết
  content:   { type: String, required: true },  // nội dung quote / thư tình
  mood:      { type: String, default: '💕' },   // emoji mood
}, { timestamps: true });

module.exports = mongoose.model('Quote', quoteSchema);