const router = require("express").Router();
const User = require("../models/User");
const Level = require("../models/Level");
const { isAuthorized, isVerified } = require("../config/checker");
const { formatLevels } = require("../config/utils");
const Transaction = require("../models/Transaction");
const moment = require("moment");

router.get("/", (req, res) => {
  let auth = false;
  let admin = false;
  let pfp = "";
  if (req.session.passport) {
    auth = true;
    pfp = req.session.passport.user.pfpUrl;
    if (req.session.passport.user.admin) {
      admin = true;
    }
  }
  res.render("index", { auth, admin, pfp });
});

router.get("/dashboard", isAuthorized, isVerified, async (req, res) => {
  console.time("dash-load");
  const user = await User.findById(req.session.passport.user._id);
  req.session.passport.user = user;
  const dbLevels = await Level.find({});
  const levelsCompleted = [];
  user.levelsCompleted.forEach((l) => {
    levelsCompleted.push(l.position);
  });
  const levels = formatLevels(
    dbLevels,
    levelsCompleted,
    user.currentLevel,
    user.coins
  );
  console.timeEnd("dash-load");
  res.render("dashboard", {
    levels,
    username: user.username,
    admin: user.admin,
    auth: true,
    pfp: user.pfpUrl,
  });
});

router.post("/graphs", isAuthorized, isVerified, async (req, res) => {
  const transactions = await Transaction.find({ type: "Investment" });
  const values = {};
  transactions.forEach((t) => {
    if (!values[t.level]) {
      values[t.level] = [t.amount];
    } else {
      values[t.level].push(t.amount);
    }
  });
  const data = {};
  Object.keys(values).forEach((k) => {
    if (values[k].length === 1) {
      values[k].push(values[k][0]);
    }
    data[
      k
    ] = `https://quickchart.io/chart?bkg=transparent&c={type:'sparkline',data:{datasets:[{backgroundColor:'rgb(14, 30, 18)',borderColor:'rgb(22,225,110)',data:[${String(
      values[k]
    )}]}]}}`;
  });
  res.json(data);
});

router.get("/leaderboard", (req, res) => {
  let admin = false;
  let auth = false;
  let pfp = "";
  if (req.session.passport) {
    auth = true;
    pfp = req.session.passport.user.pfpUrl;
    if (req.session.passport.user.admin) {
      admin = true;
    }
  }
  User.find({ banned: false, verified: true, admin: false, nc: false })
    .sort({ coins: "desc", lastLevelSolveTime: "asc" })
    .then((users) => {
      const updatedUsers = [];
      users.forEach((u) => {
        if (u.coins !== 500) {
          updatedUsers.push(u);
        }
      });
      users.forEach((u) => {
        if (u.coins === 500) {
          updatedUsers.push(u);
        }
      });
      res.render("leaderboard", { users: updatedUsers, admin, auth, pfp });
    })
    .catch((err) => res.json({ error: err }).sendStatus(500));
});

router.get("/profile", isAuthorized, async (req, res) => {
  console.time("profile-load");
  const id = req.session.passport.user._id;
  const user = await User.findById(id);
  let profileCompletion = false;
  if (!user.verified) {
    profileCompletion = true;
  }
  const transactions = await Transaction.find({ mongoId: id }).sort({
    timestamp: -1,
  });
  transactions.forEach((t) => {
    const newt = moment(t.timestamp).format("lll");
    t.updatedTimestamp = String(newt);
  });
  console.timeEnd("profile-load");
  res.render("profile", {
    user,
    transactions,
    profileCompletion,
    admin: user.admin,
    auth: true,
    pfp: user.pfpUrl,
  });
});

router.post("/profile/verify", isAuthorized, async (req, res) => {
  const id = req.session.passport.user._id;
  const user = await User.findById(id);
  user.fullName = req.body.fullName;
  user.schoolName = req.body.schoolName;
  user.verified = true;
  user.save();
  return res.send({ success: true });
});

router.get("/banned", async (req, res) => {
  if (req.session.passport) {
    const id = req.session.passport.user._id;
    const user = await User.findById(id);
    if (!user.banned) {
      res.redirect("/dashboard");
    } else {
      res.send("You have been banned. Contact mods for further clarification.");
    }
  } else {
    res.redirect("/");
  }
});

router.get("/logout", function (req, res) {
  res.clearCookie("discord.oauth");
  res.redirect("/");
});

module.exports = router;
