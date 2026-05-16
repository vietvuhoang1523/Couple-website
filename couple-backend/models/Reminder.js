const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  coupleId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ai tạo
  targetWho:  { type: String, enum: ['both', 'male', 'female'], default: 'both' },   // nhắc cho ai
  text:       { type: String, required: true },
  type:       { type: String, enum: ['daily', 'once'], default: 'daily' },
  done:       { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);