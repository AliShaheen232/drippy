const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ticker: {
    type: String,
    required: true,
  },
  totalSupply: {
    type: Number,
    required: true,
  },
  issuerAddress: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
