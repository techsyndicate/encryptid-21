const router = require("express").Router();
const { isAuthorized, isVerified } = require("../config/checker");
const { joinManipulator, leaveManipulator } = require("../config/manipulation");
const Level = require("../models/Level");
const User = require("../models/User");
const Log = require("../models/Log");
const Transaction = require("../models/Transaction");

router.post("/", isAuthorized, isVerified, async (req, res) => {
  const levelPosition = req.body.level;
  if (req.session.passport.user.currentLevel !== 0) {
    return res.redirect("/play");
  }
  if (req.session.passport.user.levelsCompleted.includes(levelPosition)) {
    return res.redirect("/play");
  }
  console.time("level-submit");
  const level = await Level.findOne({ position: levelPosition });
  const numberOfUsers = level.currentNumberOfPeople;
  level.currentNumberOfPeople = numberOfUsers + 1;
  const totalPeople = await User.countDocuments({});
  const updatedProps = joinManipulator(
    level.currentNumberOfPeople,
    totalPeople,
    level.currentValue,
    level.initialValue,
    level.returnRate
  );
  level.returnRate = updatedProps.newReturnRate;
  const oldValue = level.currentValue;
  level.currentValue = updatedProps.newValue;
  level.save();
  const id = req.session.passport.user._id;
  const user = await User.findById(id);
  const username = `${user.username}#${user.nameTag}`;
  user.coins -= oldValue;
  user.currentLevel = req.body.level;
  user.currentLevelStartTime = new Date();
  user.lastLogTime = new Date();
  user.save();
  req.session.passport.user = user;
  res.redirect("/play");
  console.timeEnd("level-submit");
  const newTransaction = new Transaction({
    mongoId: id,
    userInvolved: username,
    level: level.position,
    levelName: `${level.name} (${level.symbol})`,
    timestamp: new Date(),
    amount: oldValue,
    net: `-${oldValue}`,
    misc: "h",
    type: "Investment",
  });
  await newTransaction.save();
});

router.get("/", isAuthorized, isVerified, async (req, res) => {
  if (req.session.passport.user.currentLevel === 0) {
    return res.redirect("/dashboard");
  }
  console.time("level-play");
  const levelPosition = req.session.passport.user.currentLevel;
  const level = await Level.findOne({ position: levelPosition });
  console.timeEnd("level-play");
  res.render("play", {
    level,
    admin: req.session.passport.user.admin,
    auth: true,
    pfp: req.session.passport.user.pfpUrl,
  });
});

router.get("/info", isAuthorized, isVerified, async (req, res) => {
  const investmentTransaction = await Transaction.findOne({
    mongoId: req.session.passport.user._id,
    level: req.session.passport.user.currentLevel,
    type: "Investment",
  });
  const level = await Level.findOne({
    position: req.session.passport.user.currentLevel,
  });
  const possibleReturn =
    (level.returnRate / 100) * level.currentValue + level.currentValue;
  const net = Math.round(possibleReturn - investmentTransaction.amount);
  let netString = "";
  if (net > 0) {
    netString += `+${net}`;
  } else {
    netString = `${net}`;
  }
  const ROI = `${Math.round(possibleReturn)} (${netString})`;
  res.json({
    roiValue: ROI,
    roiRate: level.returnRate,
    currPlayers: level.currentNumberOfPeople,
    currValue: level.currentValue,
  });
});

router.post("/submit", async (req, res) => {
  if (!req.session.passport) {
    return res.send({ success: "lol" });
  }
  console.log(req.session.passport.user.banned);
  console.time("level-play-submit");
  const answer = req.body.answer.split(" ").join("").toLowerCase();
  const levelPosition = req.session.passport.user.currentLevel;
  const id = req.session.passport.user._id;
  const username = `${req.session.passport.user.username}#${req.session.passport.user.nameTag}`;
  const level = await Level.findOne({ position: levelPosition });
  const correctAnswer = level.answer.split(" ").join("").toLowerCase();

  const user = await User.findById(id);
  if (user.banned) {
    console.timeEnd("level-play-submit");
    return res.send({ success: "banned" });
  }

  if (answer !== correctAnswer) {
    res.send({ success: false });
    console.timeEnd("level-play-submit");
    user.lastLogTime = new Date();
    user.save();
  } else {
    let completed = req.session.passport.user.levelsCompleted;
    completed.push(level);
    let wasAFK = false;
    if (user.afk) {
      user.afk = false;
      wasAFK = true;
    }
    user.currentLevel = 0;
    user.levelsCompleted = completed;
    user.currentLevelStartTime = new Date(2021, 6, 24, 0, 0, 0);
    user.lastLogTime = new Date(2021, 6, 24, 0, 0, 0);
    user.lastLevelSolveTime = new Date();
    const calculatedReturn = Math.round(
      (level.returnRate / 100) * level.currentValue + level.currentValue
    );
    user.coins += calculatedReturn;
    user.save();
    req.session.passport.user = user;
    if (wasAFK) {
      level.currentNumberOfPeople = level.currentNumberOfPeople + 1;
    }
    const numberOfUsers = level.currentNumberOfPeople;
    level.currentNumberOfPeople = numberOfUsers - 1;
    const totalPeople = await User.countDocuments({});
    const updatedProps = leaveManipulator(
      numberOfUsers,
      totalPeople,
      level.currentValue,
      level.initialValue,
      level.returnRate
    );
    level.returnRate = updatedProps.newReturnRate;
    level.currentValue = updatedProps.newValue;
    level.save();
    res.send({ success: true });
    console.timeEnd("level-play-submit");
    const investmentTransaction = await Transaction.findOne({
      mongoId: req.session.passport.user._id,
      level: level.position,
      type: "Investment",
    });
    const net = calculatedReturn - investmentTransaction.amount;
    let netString = "";
    if (net > 0) {
      netString += `+${net}`;
    } else {
      netString = `${net}`;
    }
    const newTransaction = new Transaction({
      mongoId: id,
      userInvolved: username,
      level: level.position,
      levelName: `${level.name} (${level.symbol})`,
      timestamp: new Date(),
      amount: calculatedReturn,
      net: netString,
      misc: investmentTransaction.amount,
      type: "Return",
    });
    await newTransaction.save();
  }

  const newLog = await Log.create({
    answerEntered: answer,
    user: username,
    mongoId: id,
    level: levelPosition,
    timestamp: new Date(),
  });

  await newLog.save();
});

module.exports = router;
