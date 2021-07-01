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

const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://ANYONE:rDjStnckO5W9gvlm@daan-zwarthoed-blok-tec.ei2ci.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  if (err) throw err;
  db = client.db("my-chess-app");
  matchCollection = db.collection("matches");
});

app.get("/", (req, res) => {
  res.render("index", { popupStatus: "show" });
});

let popupStatus;

app.post("/", (req, res) => {
  if (req.body.room) {
    matchCollection
      .findOne({ room: req.body.room })
      .then((results) => {
        if (results) {
          if (results.users.includes(req.body.username)) {
            popupStatus = "hidden";
            res.render("index", { roomName: req.body.room, popupStatus });
          } else if (results.users.length === 2) {
            popupStatus = "full";
          } else {
            matchCollection.findOneAndUpdate(
              { room: req.body.room },
              {
                $push: {
                  users: req.body.username,
                },
              },
              {
                upsert: true,
              }
            );
            popupStatus = "hidden";
          }
        } else {
          matchCollection.insertOne({
            room: req.body.room,
            users: [req.body.username],
          });
          popupStatus = "hidden";
        }
      })
      .then(() => {
        // res.render("index", { roomName: req.body.room, popupStatus });
      });
  }
});

app.get("*", function (req, res) {
  res.send("404 page not found", 404);
});

io.on("connection", (socket) => {
  socket.on("move", (move) => {
    matchCollection.findOneAndUpdate(
      { room: move.room },
      {
        $push: {
          moves: move,
        },
      },
      {
        upsert: true,
      }
    );
    io.to(move.room).emit("move", move);
  });

  socket.on("join room", (room) => {
    if (room) {
      socket.join(room);
      matchCollection.findOne({ room: room }).then((results) => {
        if (results) {
          if (results.moves.length !== 0) {
            for (let i = 0; i < results.moves.length; i++) {
              io.to(room).emit("move", results.moves[i]);
            }
          }
        }
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
