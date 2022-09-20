require("dotenv").config();

import express from "express";
import fetch from "node-fetch";
import session from "express-session";
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import request from "request";

import join from "./routes/join";

declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

const app = express();

app.use(
  session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false })
);
app.use(passport.session());
app.use(passport.initialize());

app.set("views", "./src/views");
app.set("view engine", "ejs");

app.use(express.static("src/public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/img", express.static(__dirname + "public/img"));

app.use(join);


OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
  const options = {
    url: "https://api.twitch.tv/helix/users",
    method: "GET",
    headers: {
      "Client-ID": TWITCH_CLIENT_ID,
      Accept: "application/vnd.twitchtv.v5+json",
      Authorization: "Bearer " + accessToken,
    },
  };

  request(
    options,
    function (error: any, response: { statusCode: number }, body: string) {
      if (response && response.statusCode == 200) {
        done(null, JSON.parse(body));
      } else {
        done(JSON.parse(body));
      }
    }
  );
};

passport.serializeUser(function (
  user: any,
  done: (arg0: any, arg1: any) => void
) {
  done(null, user);
});

passport.deserializeUser(function (
  user: any,
  done: (arg0: any, arg1: any) => void
) {
  done(null, user);
});

passport.use(
  "twitch",
  new OAuth2Strategy(
    {
      authorizationURL: "https://id.twitch.tv/oauth2/authorize",
      tokenURL: "https://id.twitch.tv/oauth2/token",
      clientID: TWITCH_CLIENT_ID,
      clientSecret: TWITCH_SECRET,
      callbackURL: CALLBACK_URL,
      state: true,
    },
    function (
      accessToken: any,
      refreshToken: any,
      profile: { accessToken: any; refreshToken: any },
      done: (arg0: any, arg1: any) => void
    ) {
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;

      // Securely store user profile in your DB
      //User.findOrCreate(..., function(err, user) {
      //  done(err, user);
      //});

      done(null, profile);
    }
  )
);

// Set route to start OAuth link, this is where you define scopes to request
app.get("/auth/twitch", passport.authenticate("twitch", { scope: "" }));

// Set route for OAuth redirect
app.get(
  "/auth/twitch/callback",
  passport.authenticate("twitch", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

app.get("/", async (req: any, res: any) => {
  const global = await fetch(`https://api.kattah.me/global`).then((res) =>
    res.json()
  );
  const { logging_since, logging_channels } = global.data;
  const emotes = global.data.global[0].emotes;
  const sortbyTopUsage = emotes.sort(
    (a: { usage: number }, b: { usage: number }) => b.usage - a.usage
  );

  const { channels, data } = await fetch(`https://api.kattah.me/top`).then(
    (res) => res.json()
  );
  const sorted = data.sort(
    (a: { usage: number }, b: { usage: number }) => b.usage - a.usage
  );

  res.render("global", {
    global: sortbyTopUsage,
    channels: logging_channels.toLocaleString(),
    since: logging_since.split("T")[0],
    channelEmotes: sorted,
    session: req.session,
  });
});

app.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    } else {
      return res.redirect("/");
    }
  });
})

app.get("/search", async (req, res) => {
  res.render("search", {
    session: req.session,
  });
});

app.get("/c", async (req, res) => {
  const user = req.query.user;
  const userData = await fetch(`https://api.kattah.me/c/${user}`).then((res) =>
    res.json()
  );
  const loginToUID = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${user}`).then((res) => res.json());
  const stvData = await fetch(`https://7tv.io/v3/users/twitch/${loginToUID[0]["id"]}`).then((res) => res.json());
  res.render("channel", {
    channel: user,
    emotes: userData,
    stv: stvData
  });
});

app.listen(5003, () => {
  console.log("Server started on port 5003");
});
