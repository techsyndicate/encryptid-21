const DiscordStrategy = require("passport-discord").Strategy;
const passport = require("passport");
const User = require("../models/User");
const axios = require("axios");
require("dotenv").config();

const scopes = ["identify", "email"];

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  if (user) {
    done(null, user);
  }
});

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URI,
      scope: scopes,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (profile.verified) {
          const user = await User.findOne({ userId: profile.id });
          if (user) {
            done(null, user);
          } else {
            let pfp = "";
            if (profile.avatar == null) {
              pfp =
                "https://media.pocketgamer.biz/2021/5/110514/discord-new-logo-2021-r225x.jpg";
            } else {
              pfp = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
            }
            const newUser = await User.create({
              username: profile.username,
              pfpUrl: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
              nameTag: profile.discriminator,
              email: profile.email,
              userId: profile.id,
              coins: 500,
              currentLevel: 0,
              levelsCompleted: [],
              banned: false,
              admin: false,
              allowNegativeBalance: false,
              createdOn: new Date(profile.fetchedAt),
            });
            const savedUser = await newUser.save();
            const data = JSON.stringify({
              avatar_url: "https://github.com/techsyndicate.png",
              embeds: [
                {
                  title: "New Registration",
                  description: `${profile.username}#${profile.discriminator}`,
                  thumbnail: {
                    url: `${pfp}`,
                  },
                  url: `https://encryptid.us/admin/userinfo?id=${savedUser._id}`,
                },
              ],
            });
            const config = {
              method: "post",
              url: "https://discord.com/api/webhooks/866734583454236672/04GMX6FdFgp7zlvxacgfyOCZuCqiex9Cl8Xi0n-CjwDoy-mWaKmMu1Ad0cRpICKau-j3",
              headers: {
                "Content-Type": "application/json",
              },
              data: data,
            };
            axios(config)
              .then(function (response) {
                done(null, savedUser);
              })
              .catch(function (error) {
                console.log(error);
                done(null, savedUser);
              });
          }
        } else {
          done(
            "The email associated with your account is not verified. Please verify to create an account.",
            null
          );
        }
      } catch (err) {
        console.log(err);
        done(err, null);
      }
    }
  )
);
