require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
const axios = require("axios");
const discordStrategy = require("./config/discordStrategy");
const User = require("./models/User");
const Level = require("./models/Level");
const { redirects } = require("./config/utils");
const { joinManipulator, leaveManipulator } = require("./config/manipulation");

const app = express();

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

// Passport
app.use(passport.initialize());
app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`,
    cookie: {
      maxAge: 60000 * 60 * 24,
    },
    saveUninitialized: false,
    resave: false,
    name: "discord.oauth",
  })
);
app.use(passport.session());

// View Engine Setup
app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());

// AFK checker
const configGenerator = (desc) => {
  let data = {
    avatar_url: "https://github.com/techsyndicate.png",
    embeds: [
      {
        title: "AFK Reporter",
        description: desc,
      },
    ],
  };

  const config = {
    method: "post",
    url: "https://discord.com/api/webhooks/866734583454236672/04GMX6FdFgp7zlvxacgfyOCZuCqiex9Cl8Xi0n-CjwDoy-mWaKmMu1Ad0cRpICKau-j3",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
  };

  return config;
};

const checkAFK = () => {
  User.find({}, (err, users) => {
    if (!err) {
      users.forEach(async (user) => {
        if (user.currentLevel !== 0) {
          const defaultTime = new Date(2021, 6, 24, 0, 0, 0);
          const userTime = user.lastLogTime;
          if (String(userTime) !== String(defaultTime)) {
            const diff = Date.now() - userTime;
            const seconds = diff / 1000;
            if (seconds > 1800) {
              // deleted
            } else {
              if (user.afk) {
                user.afk = false;
                Level.findOne(
                  { position: user.currentLevel },
                  async (err, level) => {
                    if (!err) {
                      const numberOfUsers = level.currentNumberOfPeople;
                      level.currentNumberOfPeople = numberOfUsers + 1;
                      const totalPeople = await User.countDocuments({});
                      const updatedProps = joinManipulator(
                        numberOfUsers,
                        totalPeople,
                        level.currentValue,
                        level.initialValue,
                        level.returnRate
                      );
                      level.returnRate = updatedProps.newReturnRate;
                      level.currentValue = updatedProps.newValue;
                      level.save();
                      user.save();
                      const description = `${user.username}#${user.nameTag}'s afk status changed to ${user.afk} on ${level.name} (${level.symbol})`;
                      console.log(description);
                    }
                  }
                );
              }
            }
          }
        }
      });
    }
  });
  setTimeout(checkAFK, 5 * 60 * 1000);
};

checkAFK();

// reset values
const resetValues = () => {
  Level.find({}, (err, levels) => {
    if (!err) {
      levels.forEach((level) => {
        if (level.currentValue < level.initialValue || level.returnRate < 10) {
          if (level.currentValue < level.initialValue) {
            level.currentValue = level.initialValue;
          }
          if (level.returnRate < 10) {
            level.returnRate = 10;
          }
          const description = `Value for ${level.name} (${level.symbol}) reset.`;
          axios(configGenerator(description))
            .then((res) => {
              console.log("sent");
            })
            .catch((err) => {
              console.log(err);
            });
          level.save();
        }
      });
    }
  });
  setTimeout(resetValues, 5 * 60 * 1000);
};

resetValues();

// Allowed hosts
const allowedHosts = ["encryptid.us", "localhost", "internal.encryptid.us"];
const checkHosts = (req, res, next) => {
  if (allowedHosts.includes(req.hostname)) {
    return next();
  }

  return res.sendStatus(403);
};

app.use(checkHosts);

// Routes
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const playRouter = require("./routes/play");
const adminRouter = require("./routes/admin");

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/play", playRouter);
app.use("/admin", adminRouter);
app.get("/:backlink", (req, res) => {
  try {
    const val = redirects[req.params.backlink];
    if (val.link) {
      res.redirect(val.content);
    } else if (val.link === false) {
      res.send(
        `<html><p>${val.content}</p><br><br><!-- ${val.source} !><br><br></html>`
      );
    }
  } catch (error) {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on ${PORT}`));
