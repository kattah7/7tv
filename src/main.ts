import express from "express";
import fetch from "node-fetch";
const app = express();

app.set("views", "./src/views");
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const global = await fetch(`https://api.kattah.me/global`).then((res) =>
    res.json()
  );
  const { logging_since, logging_channels } = global.data;
  const emotes = global.data.global[0].emotes;
  const sortbyTopUsage = emotes.sort(
    (a: { usage: number }, b: { usage: number }) => b.usage - a.usage
  );

  res.render("global", {
    global: sortbyTopUsage,
    channels: logging_channels.toLocaleString(),
    since: logging_since.split("T")[0],
  });
});

app.get("/top", async (req, res) => {
  const { channels, data } = await fetch(`https://api.kattah.me/top`).then(
    (res) => res.json()
  );
  const sorted = data.sort(
    (a: { usage: number }, b: { usage: number }) => b.usage - a.usage
  );
  res.render("top", {
    channels: channels,
    emotes: sorted,
  });
});

app.get("/c/:user", async (req, res) => {
  const user = await fetch(
    `https://api.kattah.me/c/${req.params.user.toLocaleLowerCase()}`
  ).then((res) => res.json());
  res.render("channel", {
    channel: req.params.user,
    emotes: user,
  });
});

app.listen(5003, () => {
  console.log("Server started on port 5003");
});
