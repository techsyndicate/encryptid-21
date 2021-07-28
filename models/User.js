const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    default: "h",
  },
  schoolName: {
    type: String,
    required: true,
    default: "h",
  },
  username: {
    type: String,
    required: true,
  },
  pfpUrl: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  nameTag: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  coins: {
    type: Number,
    required: true,
    default: 0,
  },
  currentLevel: {
    type: Number,
    required: true,
    default: 0,
  },
  currentLevelStartTime: {
    type: Date,
    required: true,
    default: new Date(2021, 6, 24, 0, 0, 0),
  },
  lastLevelSolveTime: {
    type: Date,
    required: true,
    default: new Date(2021, 6, 24, 0, 0, 0),
  },
  lastLogTime: {
    type: Date,
    required: true,
    default: new Date(2021, 6, 24, 0, 0, 0),
  },
  levelsCompleted: {
    type: Array,
    required: true,
  },
  afk: {
    type: Boolean,
    required: true,
    default: false,
  },
  banned: {
    type: Boolean,
    required: true,
    default: false,
  },
  admin: {
    type: Boolean,
    required: true,
    default: false,
  },
  nc: {
    type: Boolean,
    required: true,
    default: false,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  allowedNegativeBalance: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdOn: {
    type: Date,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
