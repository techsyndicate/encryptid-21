const router = require("express").Router();
const { isAuthorized, isAdmin } = require("../config/checker");
const User = require("../models/User");
const Log = require("../models/Log");
const Level = require("../models/Level");
const moment = require("moment");

router.get("/", isAuthorized, isAdmin, (req, res) => {
  res.render("admin", {
    username: `${req.session.passport.user.username}#${req.session.passport.user.nameTag}`,
    admin: true,
    auth: true,
    pfp: req.session.passport.user.pfpUrl,
  });
});

router.get("/numberofafk", isAuthorized, isAdmin, (req, res) => {
  User.find({ afk: true }, (err, users) => {
    if (err) res.status(500).send(err);
    res.json(users);
  });
});

router.get("/users", isAuthorized, isAdmin, (req, res) => {
  User.find({})
    .then((users) => {
      if (users) {
        res.render("users", {
          allUsers: users,
          admin: true,
          auth: true,
          pfp: req.session.passport.user.pfpUrl,
        });
      } else {
        console.log("users not found");
      }
    })
    .catch((err) => res.json({ error: err }).sendStatus(500));
});

router.get("/userinfo", isAuthorized, isAdmin, (req, res) => {
  const id = req.query.id;
  User.findById(id)
    .then(async (user) => {
      if (user) {
        if (user.currentLevel === 0) {
          user.currentLevelName = "None";
        } else {
          const level = await Level.findOne({ position: user.currentLevel });
          user.currentLevelName = `${level.name} (${level.symbol})`;
        }
        user.llt = moment(user.lastLogTime).format("lll");
        user.clst = moment(user.currentLevelStartTime).format("lll");
        user.llst = moment(user.lastLevelSolveTime).format("lll");
        res.render("userinfo", {
          info: user,
          admin: true,
          auth: true,
          pfp: req.session.passport.user.pfpUrl,
        });
      } else {
        console.log("user info not found");
      }
    })
    .catch((err) => res.json({ error: err }).sendStatus(500));
});

router.get("/logs", isAuthorized, isAdmin, (req, res) => {
  Log.find()
    .sort({ timestamp: -1 })
    .limit(100)
    .then((logs) => {
      if (logs) {
        logs.forEach((l) => {
          const newt = moment(l.timestamp).format("lll");
          l.updatedTimestamp = newt;
        });
        res.render("logs", {
          logs: logs,
          admin: true,
          auth: true,
          pfp: req.session.passport.user.pfpUrl,
        });
      }
    })
    .catch((err) => {
      res.json({
        body: "Could not find logs",
        statusCode: 400,
      });
    });
});

router.get("/levels", isAuthorized, isAdmin, (req, res) => {
  Level.find({})
    .then((levels) => {
      if (levels) {
        res.render("levels", {
          levels: levels,
          admin: true,
          auth: true,
          pfp: req.session.passport.user.pfpUrl,
        });
      } else {
        console.log("no levels");
      }
    })
    .catch((err) => {
      res.json({ error: err }).sendStatus(500);
    });
});

router.get("/ban", isAuthorized, isAdmin, (req, res) => {
  const id = req.query.id;
  User.updateOne(
    { _id: id },
    {
      $set: {
        banned: true,
      },
    }
  )
    .then(() => {
      res.json({
        body: "banned",
        statusCode: 200,
      });
    })
    .catch((err) => {
      res.json({
        body: "Could not ban",
        statusCode: 400,
      });
    });
});

router.get("/unban", isAuthorized, isAdmin, (req, res) => {
  const id = req.query.id;
  User.updateOne(
    { _id: id },
    {
      $set: {
        banned: false,
      },
    }
  )
    .then(() => {
      res.json({
        body: "unbanned",
        statusCode: 200,
      });
    })
    .catch((err) => {
      res.json({
        body: "Could not unban",
        statusCode: 400,
      });
    });
});

router.get("/userlogs", isAuthorized, isAdmin, (req, res) => {
  const id = req.query.id;
  Log.find({ mongoId: id })
    .sort({ timestamp: -1 })
    .limit(50)
    .then((logs) => {
      if (logs) {
        logs.forEach((l) => {
          const newt = moment(l.timestamp).format("lll");
          l.updatedTimestamp = newt;
        });
        res.render("userlogs", {
          logs: logs,
          admin: true,
          auth: true,
          pfp: req.session.passport.user.pfpUrl,
        });
      } else {
        console.log("Could not find logs");
      }
    })
    .catch((err) => {
      res.json({ error: err }).sendStatus(500);
    });
});

router.get("/addLevel", isAuthorized, isAdmin, (req, res) => {
  const position = req.query.lP;
  const question = req.query.lQ;
  const answer = req.query.lA;
  const initialValue = req.query.lB;
  const sourceCodeHint = req.query.lS;
  const returnRate = req.query.lR;
  const name = req.query.lN;
  const symbol = req.query.lSY;

  newLevel = new Level({
    position,
    name,
    symbol,
    question,
    answer,
    sourceCodeHint,
    returnRate,
    initialValue,
    currentValue: initialValue,
  });

  newLevel
    .save()
    .then((response) => {
      res.json({
        body: "Level Added",
        statusCode: 200,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        body: "Could not add level",
        statusCode: 400,
      });
    });
});

module.exports = router;
