const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  net: {
    type: String,
    required: true,
  },
  misc: {
    type: String,
    required: true,
  },
  levelName: {
    type: String,
    required: true,
  },
  userInvolved: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  mongoId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
