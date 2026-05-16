const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  coupleId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url:       { type: String, required: true },
  caption:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);