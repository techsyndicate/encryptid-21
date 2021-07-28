const passport = require("passport");
const router = require("express").Router();

router.get("/discord", passport.authenticate("discord"));

router.get(
  "/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/",
    successRedirect: "/dashboard",
  })
);

module.exports = router;
