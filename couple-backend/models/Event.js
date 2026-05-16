const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  coupleId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  date:      { type: String, required: true }, // YYYY-MM-DD
  type:      { type: String, enum: ['anniversary', 'date', 'special'], default: 'special' },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);