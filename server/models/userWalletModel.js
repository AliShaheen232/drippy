const mongoose = require('mongoose');

const userWalletSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  trustLine: {
    currency: {
      type: String,
      default: 'DRIPPY',
    },
    issuer: {
      type: String,
      required: true,
    },
    limitAmount: {
      type: Number,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserWallet = mongoose.model('UserWallet', userWalletSchema);

module.exports = UserWallet;
