const User = require("../models/User");

module.exports = {
  isAuthorized: async (req, res, next) => {
    if (req.session.passport) {
      const user = await User.findById(req.session.passport.user._id);
      if (user.banned) {
        res.redirect("/banned");
      } else {
        next();
      }
    } else {
      res.redirect("/");
    }
  },

  isAdmin: (req, res, next) => {
    User.findById(req.session.passport.user._id)
      .then((user) => {
        if (user) {
          if (user.admin) {
            next();
          } else {
            res.redirect("/dashboard");
          }
        } else {
          res.redirect("/");
        }
      })
      .catch((err) => res.json({ error: err }).sendStatus(500));
  },

  isVerified: (req, res, next) => {
    User.findById(req.session.passport.user._id)
      .then((user) => {
        if (user) {
          if (user.verified) {
            next();
          } else {
            res.redirect("/profile");
          }
        } else {
          res.redirect("/");
        }
      })
      .catch((err) => res.json({ error: err }).sendStatus(500));
  },
};
