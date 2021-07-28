const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  answerEntered: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  mongoId: {
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
});

const Log = mongoose.model("Log", LogSchema);

module.exports = Log;
