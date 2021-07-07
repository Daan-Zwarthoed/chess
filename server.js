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
let userColor;
let timer;
let intervalIsActiveForRoom = [];

app.post("/", (req, res) => {
  if (req.body.room) {
    matchCollection
      .findOne({ room: req.body.room })
      .then((results) => {
        timer = {
          secondeWhite: 0,
          minutenWhite: 10,
          secondeBlack: 0,
          minutenBlack: 10,
        };
        if (results) {
          if (results.timer) {
            timer = {
              secondeWhite: results.timer.secondeWhite,
              minutenWhite: results.timer.minutenWhite,
              secondeBlack: results.timer.secondeBlack,
              minutenBlack: results.timer.minutenBlack,
            };
          }
          userColor =
            results.users[0] === req.body.username ? "white" : "black";
          if (results.users.includes(req.body.username)) {
            popupStatus = "hidden";
          } else if (results.users.length === 2) {
            userColor = "spectate";
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
          userColor = "white";
          popupStatus = "hidden";
        }
      })
      .then(() => {
        res.render("index", {
          roomName: req.body.room,
          userName: req.body.username,
          popupStatus,
          userColor,
          timer,
        });
      });
  }
});

app.get("*", function (req, res) {
  res.send("404 page not found", 404);
});

io.on("connection", (socket) => {
  socket.on("move", (req) => {
    matchCollection.findOneAndUpdate(
      { room: req.room },
      {
        $set: {
          chessboard: req.chessboard,
          aanZet: req.aanZet,
        },
      },
      {
        upsert: true,
      }
    );
    io.to(req.room).emit("load board", {
      chessboard: req.chessboard,
      aanZet: req.aanZet,
      username: req.username,
    });
  });

  function updateTimer() {
    matchCollection
      .findOneAndUpdate(
        { room: room },
        {
          $set: {
            timer: timer,
          },
        },
        {
          upsert: true,
        }
      )
      .then((results) => {
        if (results.value.aanZet === "black") {
          timer.secondeBlack--;
          if (timer.secondeBlack <= 0) {
            timer.minutenBlack--;
            timer.secondeBlack = 59;
          }
        } else {
          timer.secondeWhite--;
          if (timer.secondeWhite <= 0) {
            timer.minutenWhite--;
            timer.secondeWhite = 59;
          }
        }
      });
    io.to(room).emit("timer update", timer);
  }

  socket.on("start timer", (req) => {
    if (!intervalIsActiveForRoom.includes(req)) {
      intervalIsActiveForRoom.push(req);
      room = req;
      matchCollection.findOne({ room: req }).then((results) => {
        if (results) {
          results.timer = timer;
        }
      });
      setInterval(updateTimer, 1000);
    }
  });

  socket.on("join room", (req) => {
    if (req) {
      socket.join(req.room);
      io.to(req.room).emit("timer request", {
        username: req.username,
        room: req.room,
      });
      matchCollection.findOne({ room: req.room }).then((results) => {
        if (results) {
          if (results.chessboard) {
            io.to(req.room).emit("load board", {
              chessboard: results.chessboard,
              aanZet: results.aanZet,
            });
          }
        }
      });
    }
  });

  socket.on("timer request", (req) => {
    if (req) {
      io.to(req.room).emit("timer request", {
        secondeWhite: req.secondeWhite,
        minutenWhite: req.minutenWhite,
        secondeBlack: req.secondeBlack,
        minutenBlack: req.minutenBlack,
        room: req.room,
        username: req.username,
      });
    }
  });

  socket.on("reset room", (req) => {
    matchCollection
      .findOneAndUpdate(
        { room: req.room },
        {
          $set: {
            chessboard: defaultChessboard,
            aanZet: "white",
            timer: {
              secondeWhite: 0,
              minutenWhite: 10,
              secondeBlack: 0,
              minutenBlack: 10,
            },
          },
        },
        {
          upsert: true,
        }
      )
      .then(() => {
        intervalIsActiveForRoom = intervalIsActiveForRoom.filter(
          (e) => e !== req.room
        );
        io.to(req.room).emit("page reload");
      });
  });
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const defaultChessboard =
  '<div class="0"><div class="0"><img class="black rook" src="images/blackRook.png" alt="black rook"></div><div class="1"><img class="black knight" src="images/blackKnight.png" alt="black knight"></div><div class="2"><img class="black bishop" src="images/blackBishop.png" alt="black bishop"></div><div class="3"><img class="black queen" src="images/blackQueen.png" alt="black queen"></div><div class="4"><img class="black king" src="images/blackKing.png" alt="black king"></div><div class="5"><img class="black bishop" src="images/blackBishop.png" alt="black bishop"></div><div class="6"><img class="black knight" src="images/blackKnight.png" alt="black knight"></div><div class="7"><img class="black rook" src="images/blackRook.png" alt="black rook"></div></div><div class="1"><div class="0"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="1"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="2"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="3"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="4"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="5"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="6"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="7"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div></div><div class="2"><div class="0"></div><div class="1"></div><div class="2"></div><div class="3"></div><div class="4"></div><div class="5"></div><div class="6"></div><div class="7"></div></div><div class="3"><div class="0"></div><div class="1"></div><div class="2"></div><div class="3"></div><div class="4"></div><div class="5"></div><div class="6"></div><div class="7"></div></div><div class="4"><div class="0"></div><div class="1"></div><div class="2"></div><div class="3"></div><div class="4"></div><div class="5"></div><div class="6"></div><div class="7"></div></div><div class="5"><div class="0"></div><div class="1"></div><div class="2"></div><div class="3"></div><div class="4"></div><div class="5"></div><div class="6"></div><div class="7"></div></div><div class="6"><div class="0"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="1"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="2"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="3"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="4"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="5"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="6"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="7"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div></div><div class="7"><div class="0"><img class="white rook" src="images/whiteRook.png" alt="white rook"></div><div class="1"><img class="white knight" src="images/whiteKnight.png" alt="white knight"></div><div class="2"><img class="white bishop" src="images/whiteBishop.png" alt="white bishop"></div><div class="3"><img class="white queen" src="images/whiteQueen.png" alt="white queen"></div><div class="4"><img class="white king" src="images/whiteKing.png" alt="white king"></div><div class="5"><img class="white bishop" src="images/whiteBishop.png" alt="white bishop"></div><div class="6"><img class="white knight" src="images/whiteKnight.png" alt="white knight"></div><div class="7"><img class="white rook" src="images/whiteRook.png" alt="white rook"></div></div>';
