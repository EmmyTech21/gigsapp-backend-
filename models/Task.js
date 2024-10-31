const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  budget: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  bids: { type: Number, default: 0 },
  image: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add user reference
});

module.exports = mongoose.model('Task', taskSchema);
