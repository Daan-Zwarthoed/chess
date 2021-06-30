/* eslint-disable no-undef */
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 8080;
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "static/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.locals.basedir = path.join(__dirname, "views");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("*", function (req, res) {
  res.send("404 page not found", 404);
});

io.on("connection", (socket) => {
  socket.on("move", (move) => {
    io.emit("move", {
      move,
    });
  });
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
