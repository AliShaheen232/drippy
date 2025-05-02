const express = require('express');
const Token = require('../models/tokenModel');
const UserWallet = require('../models/userWalletModel');
const router = express.Router();

// Create Token
router.post('/createToken', async (req, res) => {
  const { name, ticker, totalSupply, issuerAddress } = req.body;

  try {
    const token = new Token({
      name,
      ticker,
      totalSupply,
      issuerAddress,
    });

    await token.save();
    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating token' });
  }
});

// Create User Wallet
router.post('/createUserWallet', async (req, res) => {
  const { walletAddress, trustLineIssuer, trustLineLimitAmount } = req.body;

  try {
    const userWallet = new UserWallet({
      walletAddress,
      trustLine: {
        currency: 'DRIPPY',
        issuer: trustLineIssuer,
        limitAmount: trustLineLimitAmount,
      },
    });

    await userWallet.save();
    res.status(201).json({ success: true, userWallet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating user wallet' });
  }
});

module.exports = router;
