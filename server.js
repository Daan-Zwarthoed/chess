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

let popupStatus;
let userColor;
let timer;
let timerInRoom = [];

function updateTimer() {
  timerInRoom.forEach((timerRoom) => {
    timerInRoom.filter((e) => e !== timerRoom);
    matchCollection.findOne({ room: timerRoom }).then((results) => {
      if (!results) return;
      let personalTimer = results.timer;
      if (results.aanZet === "black") {
        personalTimer.secondeBlack--;
        if (personalTimer.secondeBlack <= 0) {
          personalTimer.minutenBlack--;
          personalTimer.secondeBlack = 59;
        }
      } else {
        personalTimer.secondeWhite--;
        if (personalTimer.secondeWhite <= 0) {
          personalTimer.minutenWhite--;
          personalTimer.secondeWhite = 59;
        }
      }
      matchCollection.findOneAndUpdate(
        { room: timerRoom },
        {
          $set: {
            timer: personalTimer,
          },
        },
        {
          upsert: true,
        }
      );
      io.to(timerRoom).emit("timer update", personalTimer);
    });
  });
}

setInterval(updateTimer, 1000);

app.get("/", (req, res) => {
  res.render("index", { popupStatus: "show" });
});

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

          if (results.users) {
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
          }
        } else {
          matchCollection.insertOne({
            room: req.body.room,
            main: defaultMain,
            aanZet: "white",
            users: [req.body.username],
            timer: timer,
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
          main: req.main,
          aanZet: req.aanZet,
        },
      },
      {
        upsert: true,
      }
    );

    io.to(req.room).emit("load board", {
      main: req.main,
      aanZet: req.aanZet,
      username: req.username,
    });
  });

  socket.on("start timer", (req) => {
    if (!timerInRoom.includes(req)) {
      timerInRoom.push(req);
      room = req;
      matchCollection.findOne({ room: req }).then((results) => {
        if (results) {
          results.timer = timer;
        }
      });
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
          if (results.main) {
            io.to(req.room).emit("load board", {
              main: results.main,
              aanZet: results.aanZet,
            });
          }
        }
      });
    }
  });

  socket.on("reset room", (req) => {
    matchCollection
      .findOneAndUpdate(
        { room: req.room },
        {
          $set: {
            main: defaultMain,
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
        timerInRoom = timerInRoom.filter((e) => e !== req.room);
        io.to(req.room).emit("page reload");
      });
  });
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const defaultMain =
  '<section class="verlorenPieces"><ul></ul></section><div class="chessboard"><div class="0"><div class="0"><img class="black rook" src="images/blackRook.png" alt="black rook"></div><div class="1"><img class="black knight" src="images/blackKnight.png" alt="black knight"></div><div class="2"><img class="black bishop" src="images/blackBishop.png" alt="black bishop"></div><div class="3"><img class="black queen" src="images/blackQueen.png" alt="black queen"></div><div class="4"><img class="black king" src="images/blackKing.png" alt="black king"></div><div class="5"><img class="black bishop" src="images/blackBishop.png" alt="black bishop"></div><div class="6"><img class="black knight" src="images/blackKnight.png" alt="black knight"></div><div class="7"><img class="black rook" src="images/blackRook.png" alt="black rook"></div></div><div class="1"><div class="0"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="1"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="2"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="3"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="4"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="5"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="6"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div><div class="7"><img class="black pawn" src="images/blackPawn.png" alt="black pawn"></div></div><div class="2"><div class="0"></div><div class="1"></div><div class="2"></div><div class="3"></div><div class="4"></div><div class="5"></div><div class="6"></div><div class="7"></div></div><div class="3"><div class="0"></div><div class="1"></div><div class="2"></div><div class="3"></div><div class="4"></div><div class="5"></div><div class="6"></div><div class="7"></div></div><div class="4"><div class="0"></div><div class="1"></div><div class="2"></div><div class="3"></div><div class="4"></div><div class="5"></div><div class="6"></div><div class="7"></div></div><div class="5"><div class="0"></div><div class="1"></div><div class="2"></div><div class="3"></div><div class="4"></div><div class="5"></div><div class="6"></div><div class="7"></div></div><div class="6"><div class="0"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="1"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="2"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="3"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="4"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="5"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="6"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div><div class="7"><img class="white pawn" src="images/whitePawn.png" alt="white pawn"></div></div><div class="7"><div class="0"><img class="white rook" src="images/whiteRook.png" alt="white rook"></div><div class="1"><img class="white knight" src="images/whiteKnight.png" alt="white knight"></div><div class="2"><img class="white bishop" src="images/whiteBishop.png" alt="white bishop"></div><div class="3"><img class="white queen" src="images/whiteQueen.png" alt="white queen"></div><div class="4"><img class="white king" src="images/whiteKing.png" alt="white king"></div><div class="5"><img class="white bishop" src="images/whiteBishop.png" alt="white bishop"></div><div class="6"><img class="white knight" src="images/whiteKnight.png" alt="white knight"></div><div class="7"><img class="white rook" src="images/whiteRook.png" alt="white rook"></div></div></div><section class="verlorenPieces"><ul></ul></section>';
