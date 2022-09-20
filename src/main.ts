import express from "express";
import fetch from "node-fetch";
const app = express();

app.set("views", "./src/views");
app.set("view engine", "ejs");

app.use(express.static("src/public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/img", express.static(__dirname + "public/img"));

app.get("/", async (req, res) => {
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
  });
});

app.get("/search", async (req, res) => {
  res.render("search");
});

app.get("/c", async (req, res) => {
  const user = req.query.user
  const userData = await fetch(
    `https://api.kattah.me/c/${user}`
  ).then((res) => res.json());
  res.render("channel", {
    channel: user,
    emotes: userData,
  });
});

app.listen(5003, () => {
  console.log("Server started on port 5003");
});
