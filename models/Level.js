const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  initialValue: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
    required: true,
  },
  sourceCodeHint: {
    type: String,
  },
  currentNumberOfPeople: {
    type: Number,
    default: 0,
  },
  returnRate: {
    type: Number,
    default: 0,
  },
});

const Level = mongoose.model("Level", LevelSchema);

module.exports = Level;
