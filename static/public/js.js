let main = document.querySelector("main");

let chessboard;

let alleBlokjes = document.querySelectorAll("main > div > div > div");

let verlorenPiecesWhite = document.querySelector(
  "main > section:first-of-type > ul"
);

let verlorenPiecesBlack = document.querySelector(
  "main > section:last-of-type > ul"
);

let piecesWhite = document.querySelectorAll("main > div > div > div > .white");

let piecesBlack = document.querySelectorAll("main > div > div > div > .black");

let mogelijkeMoves;

let checkInProgress = false;

let aanZet = "white";

let moveAllowed;

let winScreen = document.querySelector("body > section:last-of-type");

let winText = document.querySelector("body > section:last-of-type > div > p");

let pawnEersteStap;

let allePieces;

let currentPiece;

let dezeMove;

let ietsTegenGekomen;

let checkMateNietMogelijk = true;

let attackBestaat = false;
let pinBestaat = false;
let moveIsGoed = false;

let blackKingMoved = false;
let whiteKingMoved = false;
let leftBlackRookMoved = false;
let rightBlackRookMoved = false;
let leftWhiteRookMoved = false;
let rightWhiteRookMoved = false;

let clockBlackMinuten = document.querySelector(
  ".clockBlack > div:first-of-type"
);
let clockBlackSeconde = document.querySelector(
  ".clockBlack > div:last-of-type"
);
let minutenBlack = clockBlackMinuten.innerHTML;
let secondeBlack = clockBlackSeconde.innerHTML;

let clockWhiteMinuten = document.querySelector(
  ".clockWhite > div:first-of-type"
);
let clockWhiteSeconde = document.querySelector(
  ".clockWhite > div:last-of-type"
);
let minutenWhite = clockWhiteMinuten.innerHTML;
let secondeWhite = clockWhiteSeconde.innerHTML;

let moves;
let h = 0;
let p;

let enemyOnderAttack;

let raaktKoning = false;
let xRayKoning = false;

let node;
var activePiece;

let userColor = document.querySelector(".userColor").innerHTML;
// eslint-disable-next-line no-undef
const socket = io();

// SEND TO SOCKET JOIN ROOM
const roomPopup = document.querySelector(".roomPopup");
const roomName = document.querySelector(".roomName");
const form = document.querySelector(".roomForm");
const usernameInput = document.querySelector(".usernameInput");
const roomInput = document.querySelector(".roomInput");
let room = document.querySelector(".roomName").innerHTML;
let username = document.querySelector(".userName").innerHTML;

if (form) {
  form.addEventListener("submit", function () {
    if (roomInput.value) {
      room = roomInput.value;
      username = usernameInput.value;
      socket.emit("join room", { username, room });
      roomName.innerHTML = room;
    }
    roomPopup.classList.remove("showPopup");
  });
}

socket.emit("join room", { room, username });

socket.on("timer update", function (req) {
  clockWhiteMinuten.innerHTML = req.minutenWhite;
  clockWhiteSeconde.innerHTML = req.secondeWhite;
  clockBlackMinuten.innerHTML = req.minutenBlack;
  clockBlackSeconde.innerHTML = req.secondeBlack;

  if (minutenBlack < 0) {
    winScreen.classList.add("showPopup");
    winText.innerHTML = "White wins by timer";
  } else if (minutenWhite < 0) {
    winScreen.classList.add("showPopup");
    winText.innerHTML = "Black wins by timer";
  }
});

// RECIEVE FROM SOCKET

socket.on("load board", function (req) {
  if (req.username != username) {
    main.innerHTML = req.main;
    aanZet = req.aanZet;

    checkCheckMate();

    chessboard = document.querySelector("main > div");

    alleBlokjes = document.querySelectorAll("main > div > div > div");

    verlorenPiecesWhite = document.querySelector(
      "main > section:first-of-type > ul"
    );

    verlorenPiecesBlack = document.querySelector(
      "main > section:last-of-type > ul"
    );

    chessboard.addEventListener("click", function () {
      selectPiece(event);
    });

    for (let i = 0; i < alleBlokjes.length; i++) {
      alleBlokjes[i].classList.remove("possibleMove");
      alleBlokjes[i].classList.remove("enemyMove");
    }
  }
});

socket.on("page reload", function () {
  location.reload();
});

// Dit is om illegaale moves te voorkomen
function movePossible(piece) {
  let slag = piece.parentElement;

  let rowPiece = piece.parentElement.parentElement.className;

  let columnPiece = piece.parentElement.classList[0];

  moveAllowed = true;

  let currentPiece = slag.children[0];

  if (
    currentPiece.classList[0] == "white" &&
    currentPiece.classList[1] == "pawn"
  ) {
    // Dit is je slaan rechts
    if (columnPiece != 7) {
      chessboard.children[rowPiece - 1].children[
        +columnPiece + 1
      ].classList.add("enemyAttack");

      if (
        chessboard.children[rowPiece - 1].children[+columnPiece + 1].children
          .length == 1
      ) {
        if (
          chessboard.children[rowPiece - 1].children[+columnPiece + 1]
            .children[0].classList[1] == "king" &&
          chessboard.children[rowPiece - 1].children[+columnPiece + 1]
            .children[0].classList[0] == "black"
        ) {
          piece.parentElement.classList.add("pieceAttackingKing");
        }
      }
    }

    // Dit is slaan links
    if (columnPiece != 0) {
      chessboard.children[rowPiece - 1].children[columnPiece - 1].classList.add(
        "enemyAttack"
      );
      if (
        chessboard.children[rowPiece - 1].children[columnPiece - 1].children
          .length == 1
      ) {
        if (
          chessboard.children[rowPiece - 1].children[columnPiece - 1]
            .children[0].classList[1] == "king" &&
          chessboard.children[rowPiece - 1].children[columnPiece - 1]
            .children[0].classList[0] == "black"
        ) {
          piece.parentElement.classList.add("pieceAttackingKing");
        }
      }
    }
  }

  // ***********
  // Einde white Pawn
  // ***********

  // ***********
  // Begin black Pawn
  // ***********

  if (
    currentPiece.classList[0] == "black" &&
    currentPiece.classList[1] == "pawn"
  ) {
    // Dit is je slaan rechts
    if (columnPiece != 7) {
      chessboard.children[+rowPiece + 1].children[
        +columnPiece + 1
      ].classList.add("enemyAttack");
      if (
        chessboard.children[+rowPiece + 1].children[+columnPiece + 1].children
          .length == 1
      ) {
        if (
          chessboard.children[+rowPiece + 1].children[+columnPiece + 1]
            .children[0].classList[1] == "king" &&
          chessboard.children[+rowPiece + 1].children[+columnPiece + 1]
            .children[0].classList[0] == "white"
        ) {
          piece.parentElement.classList.add("pieceAttackingKing");
        }
      }
    }

    // Dit is slaan links
    if (columnPiece != 0) {
      chessboard.children[+rowPiece + 1].children[
        columnPiece - 1
      ].classList.add("enemyAttack");

      if (
        chessboard.children[+rowPiece + 1].children[columnPiece - 1].children
          .length == 1
      ) {
        if (
          chessboard.children[+rowPiece + 1].children[columnPiece - 1]
            .children[0].classList[1] == "king" &&
          chessboard.children[+rowPiece + 1].children[columnPiece - 1]
            .children[0].classList[0] == "white"
        ) {
          piece.parentElement.classList.add("pieceAttackingKing");
        }
      }
    }
  }

  // ***********
  // Einde black Pawn
  // ***********

  // ***********
  // Begin rook / begin queen
  // ***********

  if (piece.classList[1] == "rook" || piece.classList[1] == "queen") {
    // Dit is voor de rook naar rechts
    for (let i = +columnPiece + 1; i <= 7; i++) {
      chessboard.children[rowPiece].children[i].classList.add("enemyAttack");

      if (raaktKoning == true) {
        chessboard.children[rowPiece].children[i].classList.add(
          "padNaarKoning"
        );
        chessboard.children[rowPiece].children[i].classList.remove(
          "enemyAttack"
        );
      }

      if (chessboard.children[rowPiece].children[i].children.length == "1") {
        p = i + 1;
        i = 7;
        enemyOnderAttack = document.querySelectorAll(".enemyAttack");

        for (let u = 0; u < enemyOnderAttack.length; u++) {
          if (enemyOnderAttack[u].children.length == "1") {
            if (
              enemyOnderAttack[u].children[0].classList[1] == "king" &&
              dezeMove.classList[0] ==
                enemyOnderAttack[u].children[0].classList[0] &&
              raaktKoning == false
            ) {
              if (p <= 7) {
                chessboard.children[rowPiece].children[p].classList.add(
                  "enemyAttack"
                );
              }
              i = columnPiece;
              raaktKoning = true;
              piece.parentElement.classList.add("pieceAttackingKing");
            }
          }
        }
      }
    }

    // Dit is voor de rook naar rechts X-ray

    for (let i = +columnPiece + 1; i <= 7; i++) {
      if (xRayKoning == true) {
        chessboard.children[rowPiece].children[columnPiece].classList.add(
          "xRayNaarKoning"
        );
        chessboard.children[rowPiece].children[i].classList.add(
          "xRayNaarKoning"
        );
      }

      if (chessboard.children[rowPiece].children[i].children.length == "1") {
        if (ietsTegenGekomen == true && xRayKoning == false) {
          p = i;
          i = 7;

          if (
            chessboard.children[rowPiece].children[p].children[0]
              .classList[1] == "king" &&
            dezeMove.classList[0] ==
              chessboard.children[rowPiece].children[p].children[0].classList[0]
          ) {
            i = columnPiece;
            xRayKoning = true;
          }
        }
        ietsTegenGekomen = true;
      }
    }
    ietsTegenGekomen = false;
    xRayKoning = false;
    raaktKoning = false;

    // // Dit is voor de rook naar linkst
    for (let i = columnPiece - 1; i >= 0; i--) {
      chessboard.children[rowPiece].children[i].classList.add("enemyAttack");

      if (raaktKoning == true) {
        chessboard.children[rowPiece].children[i].classList.add(
          "padNaarKoning"
        );
        chessboard.children[rowPiece].children[i].classList.remove(
          "enemyAttack"
        );
      }

      if (chessboard.children[rowPiece].children[i].children.length == "1") {
        p = i - 1;
        i = 0;
        enemyOnderAttack = document.querySelectorAll(".enemyAttack");

        for (let u = 0; u < enemyOnderAttack.length; u++) {
          if (enemyOnderAttack[u].children.length == "1") {
            if (
              enemyOnderAttack[u].children[0].classList[1] == "king" &&
              dezeMove.classList[0] ==
                enemyOnderAttack[u].children[0].classList[0] &&
              raaktKoning == false
            ) {
              if (p >= 0) {
                chessboard.children[rowPiece].children[p].classList.add(
                  "enemyAttack"
                );
              }
              i = columnPiece;
              raaktKoning = true;
              piece.parentElement.classList.add("pieceAttackingKing");
            }
          }
        }
      }
    }

    raaktKoning = false;

    // Dit is voor de rook naar links X-ray
    for (let i = columnPiece - 1; i >= 0; i--) {
      if (xRayKoning == true) {
        chessboard.children[rowPiece].children[columnPiece].classList.add(
          "xRayNaarKoning"
        );
        chessboard.children[rowPiece].children[i].classList.add(
          "xRayNaarKoning"
        );
      }

      if (chessboard.children[rowPiece].children[i].children.length == "1") {
        if (ietsTegenGekomen == true && xRayKoning == false) {
          p = i;
          i = 0;

          if (
            chessboard.children[rowPiece].children[p].children[0]
              .classList[1] == "king" &&
            dezeMove.classList[0] ==
              chessboard.children[rowPiece].children[p].children[0].classList[0]
          ) {
            i = columnPiece;
            xRayKoning = true;
          }
        }
        ietsTegenGekomen = true;
      }
    }
    ietsTegenGekomen = false;
    xRayKoning = false;
    raaktKoning = false;

    // Dit is voor omhoog

    for (let i = rowPiece - 1; i >= 0; i--) {
      chessboard.children[i].children[columnPiece].classList.add("enemyAttack");

      if (raaktKoning == true) {
        chessboard.children[i].children[columnPiece].classList.add(
          "padNaarKoning"
        );
        chessboard.children[i].children[columnPiece].classList.remove(
          "enemyAttack"
        );
      }

      if (chessboard.children[i].children[columnPiece].children.length == "1") {
        p = i - 1;
        i = 0;
        enemyOnderAttack = document.querySelectorAll(".enemyAttack");

        for (let u = 0; u < enemyOnderAttack.length; u++) {
          if (enemyOnderAttack[u].children.length == "1") {
            if (
              enemyOnderAttack[u].children[0].classList[1] == "king" &&
              dezeMove.classList[0] ==
                enemyOnderAttack[u].children[0].classList[0] &&
              raaktKoning == false
            ) {
              if (p >= 0) {
                chessboard.children[p].children[columnPiece].classList.add(
                  "enemyAttack"
                );
              }
              i = rowPiece;
              raaktKoning = true;
              piece.parentElement.classList.add("pieceAttackingKing");
            }
          }
        }
      }
    }

    raaktKoning = false;

    // Dit is voor de rook omhoog X-ray
    for (let i = rowPiece - 1; i >= 0; i--) {
      if (xRayKoning == true) {
        chessboard.children[rowPiece].children[columnPiece].classList.add(
          "xRayNaarKoning"
        );

        chessboard.children[i].children[columnPiece].classList.add(
          "xRayNaarKoning"
        );
      }

      if (chessboard.children[i].children[columnPiece].children.length == "1") {
        if (ietsTegenGekomen == true && xRayKoning == false) {
          p = i;
          i = 0;

          if (
            chessboard.children[p].children[columnPiece].children[0]
              .classList[1] == "king" &&
            dezeMove.classList[0] ==
              chessboard.children[p].children[columnPiece].children[0]
                .classList[0]
          ) {
            i = rowPiece;
            xRayKoning = true;
          }
        }
        ietsTegenGekomen = true;
      }
    }
    ietsTegenGekomen = false;
    xRayKoning = false;
    raaktKoning = false;

    // Dit is voor omlaag

    for (let i = +rowPiece + 1; i <= 7; i++) {
      chessboard.children[i].children[columnPiece].classList.add("enemyAttack");

      if (raaktKoning == true) {
        chessboard.children[i].children[columnPiece].classList.add(
          "padNaarKoning"
        );
        chessboard.children[i].children[columnPiece].classList.remove(
          "enemyAttack"
        );
      }

      if (chessboard.children[i].children[columnPiece].children.length == "1") {
        p = i + 1;
        i = 7;
        enemyOnderAttack = document.querySelectorAll(".enemyAttack");

        for (let u = 0; u < enemyOnderAttack.length; u++) {
          if (enemyOnderAttack[u].children.length == "1") {
            if (
              enemyOnderAttack[u].children[0].classList[1] == "king" &&
              dezeMove.classList[0] ==
                enemyOnderAttack[u].children[0].classList[0] &&
              raaktKoning == false
            ) {
              if (p <= 7) {
                chessboard.children[p].children[columnPiece].classList.add(
                  "enemyAttack"
                );
              }
              i = rowPiece;
              raaktKoning = true;
              piece.parentElement.classList.add("pieceAttackingKing");
            }
          }
        }
      }
    }

    raaktKoning = false;

    // Dit is voor de rook omlaag X-ray
    for (let i = +rowPiece + 1; i <= 7; i++) {
      if (xRayKoning == true) {
        chessboard.children[rowPiece].children[columnPiece].classList.add(
          "xRayNaarKoning"
        );

        chessboard.children[i].children[columnPiece].classList.add(
          "xRayNaarKoning"
        );
      }

      if (chessboard.children[i].children[columnPiece].children.length == "1") {
        if (ietsTegenGekomen == true && xRayKoning == false) {
          p = i;
          i = 7;

          if (
            chessboard.children[p].children[columnPiece].children[0]
              .classList[1] == "king" &&
            dezeMove.classList[0] ==
              chessboard.children[p].children[columnPiece].children[0]
                .classList[0]
          ) {
            i = rowPiece;
            xRayKoning = true;
          }
        }
        ietsTegenGekomen = true;
      }
    }
    ietsTegenGekomen = false;
    xRayKoning = false;
    raaktKoning = false;
  }

  // ***********
  // Einde Rook
  // ***********

  // ***********
  // Begin bishop
  // ***********
  if (piece.classList[1] == "bishop" || piece.classList[1] == "queen") {
    // Dit is voor de bishop naar rechtsboven
    for (let i = 1; i <= 7; i++) {
      if (rowPiece - i >= "0" && +columnPiece + i <= "7") {
        chessboard.children[rowPiece - i].children[
          +columnPiece + i
        ].classList.add("enemyAttack");

        if (raaktKoning == true) {
          chessboard.children[rowPiece - i].children[
            +columnPiece + i
          ].classList.add("padNaarKoning");
          chessboard.children[rowPiece - i].children[
            +columnPiece + i
          ].classList.remove("enemyAttack");
        }

        if (
          chessboard.children[rowPiece - i].children[+columnPiece + i].children
            .length == "1"
        ) {
          p = i + 1;
          i = 7;
          enemyOnderAttack = document.querySelectorAll(".enemyAttack");

          for (let u = 0; u < enemyOnderAttack.length; u++) {
            if (enemyOnderAttack[u].children.length == "1") {
              if (
                enemyOnderAttack[u].children[0].classList[1] == "king" &&
                dezeMove.classList[0] ==
                  enemyOnderAttack[u].children[0].classList[0] &&
                raaktKoning == false
              ) {
                if (rowPiece - p >= 0 && +columnPiece + p <= 7) {
                  chessboard.children[rowPiece - p].children[
                    +columnPiece + p
                  ].classList.add("enemyAttack");
                }
                i = 0;
                raaktKoning = true;
                piece.parentElement.classList.add("pieceAttackingKing");
              }
            }
          }
        }
      }
    }
    raaktKoning = false;

    // Dit is voor de bishop naar rechtsboven X-ray
    for (let i = 1; i <= 7; i++) {
      if (rowPiece - i >= "0" && +columnPiece + i <= "7") {
        h = i - 1;
        if (xRayKoning == true) {
          chessboard.children[rowPiece].children[columnPiece].classList.add(
            "xRayNaarKoning"
          );
          chessboard.children[rowPiece - h].children[
            +columnPiece + h
          ].classList.add("xRayNaarKoning");
        }

        if (
          chessboard.children[rowPiece - i].children[+columnPiece + i].children
            .length == "1"
        ) {
          if (ietsTegenGekomen == true && xRayKoning == false) {
            p = i;
            i = 7;

            if (
              chessboard.children[rowPiece - p].children[+columnPiece + p]
                .children[0].classList[1] == "king" &&
              dezeMove.classList[0] ==
                chessboard.children[rowPiece - p].children[+columnPiece + p]
                  .children[0].classList[0]
            ) {
              i = 1;
              xRayKoning = true;
            }
          }
          ietsTegenGekomen = true;
        }
      }
    }
    ietsTegenGekomen = false;
    xRayKoning = false;
    raaktKoning = false;

    // Dit is voor de bishop naar rechtsonder
    for (let i = 1; i <= 7; i++) {
      if (+rowPiece + i <= "7" && +columnPiece + i <= "7") {
        chessboard.children[+rowPiece + i].children[
          +columnPiece + i
        ].classList.add("enemyAttack");

        if (raaktKoning == true) {
          chessboard.children[+rowPiece + i].children[
            +columnPiece + i
          ].classList.add("padNaarKoning");
          chessboard.children[+rowPiece + i].children[
            +columnPiece + i
          ].classList.remove("enemyAttack");
        }

        if (
          chessboard.children[+rowPiece + i].children[+columnPiece + i].children
            .length == "1"
        ) {
          p = i + 1;
          i = 7;

          enemyOnderAttack = document.querySelectorAll(".enemyAttack");

          for (let u = 0; u < enemyOnderAttack.length; u++) {
            if (enemyOnderAttack[u].children.length == "1") {
              if (
                enemyOnderAttack[u].children[0].classList[1] == "king" &&
                dezeMove.classList[0] ==
                  enemyOnderAttack[u].children[0].classList[0] &&
                raaktKoning == false
              ) {
                if (+rowPiece + p <= 7 && +columnPiece + p <= 7) {
                  chessboard.children[+rowPiece + p].children[
                    +columnPiece + p
                  ].classList.add("enemyAttack");
                }
                i = 0;
                raaktKoning = true;
                piece.parentElement.classList.add("pieceAttackingKing");
              }
            }
          }
        }
      }
    }

    raaktKoning = false;

    // Dit is voor de bishop naar rechtsonder X-ray
    for (let i = 1; i <= 7; i++) {
      if (+rowPiece + i <= "7" && +columnPiece + i <= "7") {
        h = i - 1;

        if (xRayKoning == true) {
          chessboard.children[rowPiece].children[columnPiece].classList.add(
            "xRayNaarKoning"
          );
          chessboard.children[+rowPiece + h].children[
            +columnPiece + h
          ].classList.add("xRayNaarKoning");
        }

        if (
          chessboard.children[+rowPiece + i].children[+columnPiece + i].children
            .length == "1"
        ) {
          if (ietsTegenGekomen == true && xRayKoning == false) {
            p = i;
            i = 7;

            if (
              chessboard.children[+rowPiece + p].children[+columnPiece + p]
                .children[0].classList[1] == "king" &&
              dezeMove.classList[0] ==
                chessboard.children[+rowPiece + p].children[+columnPiece + p]
                  .children[0].classList[0]
            ) {
              i = 1;
              xRayKoning = true;
            }
          }
          ietsTegenGekomen = true;
        }
      }
    }
    ietsTegenGekomen = false;
    xRayKoning = false;
    raaktKoning = false;

    // Dit is voor de bishop naar linksonder
    for (let i = 1; i <= 7; i++) {
      if (+rowPiece + i <= "7" && columnPiece - i >= "0") {
        chessboard.children[+rowPiece + i].children[
          columnPiece - i
        ].classList.add("enemyAttack");

        if (raaktKoning == true) {
          chessboard.children[+rowPiece + i].children[
            columnPiece - i
          ].classList.add("padNaarKoning");
          chessboard.children[+rowPiece + i].children[
            columnPiece - i
          ].classList.remove("enemyAttack");
        }

        if (
          chessboard.children[+rowPiece + i].children[columnPiece - i].children
            .length == "1"
        ) {
          p = i + 1;
          i = 7;

          enemyOnderAttack = document.querySelectorAll(".enemyAttack");

          for (let u = 0; u < enemyOnderAttack.length; u++) {
            if (enemyOnderAttack[u].children.length == "1") {
              if (
                enemyOnderAttack[u].children[0].classList[1] == "king" &&
                dezeMove.classList[0] ==
                  enemyOnderAttack[u].children[0].classList[0] &&
                raaktKoning == false
              ) {
                if (+rowPiece + p <= 7 && columnPiece - p >= 0) {
                  chessboard.children[+rowPiece + p].children[
                    columnPiece - p
                  ].classList.add("enemyAttack");
                }
                i = 0;
                raaktKoning = true;
                piece.parentElement.classList.add("pieceAttackingKing");
              }
            }
          }
        }
      }
    }

    raaktKoning = false;

    // Dit is voor de bishop naar linksonder X-ray
    for (let i = 1; i <= 7; i++) {
      if (+rowPiece + i <= "7" && columnPiece - i >= "0") {
        h = i - 1;

        if (xRayKoning == true) {
          chessboard.children[rowPiece].children[columnPiece].classList.add(
            "xRayNaarKoning"
          );
          chessboard.children[+rowPiece + h].children[
            columnPiece - h
          ].classList.add("xRayNaarKoning");
        }

        if (
          chessboard.children[+rowPiece + i].children[columnPiece - i].children
            .length == "1"
        ) {
          if (ietsTegenGekomen == true && xRayKoning == false) {
            p = i;
            i = 7;

            if (
              chessboard.children[+rowPiece + p].children[columnPiece - p]
                .children[0].classList[1] == "king" &&
              dezeMove.classList[0] ==
                chessboard.children[+rowPiece + p].children[columnPiece - p]
                  .children[0].classList[0]
            ) {
              i = 1;
              xRayKoning = true;
            }
          }
          ietsTegenGekomen = true;
        }
      }
    }
    ietsTegenGekomen = false;
    xRayKoning = false;
    raaktKoning = false;

    // Dit is voor de bishop naar linksboven

    for (let i = 1; i <= 7; i++) {
      if (rowPiece - i >= "0" && columnPiece - i >= "0") {
        chessboard.children[rowPiece - i].children[
          columnPiece - i
        ].classList.add("enemyAttack");

        if (raaktKoning == true) {
          chessboard.children[rowPiece - i].children[
            columnPiece - i
          ].classList.add("padNaarKoning");
          chessboard.children[rowPiece - i].children[
            columnPiece - i
          ].classList.remove("enemyAttack");
        }

        if (
          chessboard.children[rowPiece - i].children[columnPiece - i].children
            .length == "1"
        ) {
          p = i + 1;
          i = 7;

          enemyOnderAttack = document.querySelectorAll(".enemyAttack");

          for (let u = 0; u < enemyOnderAttack.length; u++) {
            if (enemyOnderAttack[u].children.length == "1") {
              if (
                enemyOnderAttack[u].children[0].classList[1] == "king" &&
                dezeMove.classList[0] ==
                  enemyOnderAttack[u].children[0].classList[0] &&
                raaktKoning == false
              ) {
                if (rowPiece - p >= 0 && columnPiece - p >= 0) {
                  chessboard.children[rowPiece - p].children[
                    columnPiece - p
                  ].classList.add("enemyAttack");
                }
                i = 0;
                raaktKoning = true;
                piece.parentElement.classList.add("pieceAttackingKing");
              }
            }
          }
        }
      }
    }
    raaktKoning = false;

    // Dit is voor de bishop naar linksboven X-ray
    for (let i = 1; i <= 7; i++) {
      if (rowPiece - i >= "0" && columnPiece - i >= "0") {
        h = i - 1;

        if (xRayKoning == true) {
          chessboard.children[rowPiece].children[columnPiece].classList.add(
            "xRayNaarKoning"
          );
          chessboard.children[rowPiece - h].children[
            columnPiece - h
          ].classList.add("xRayNaarKoning");
        }

        if (
          chessboard.children[rowPiece - i].children[columnPiece - i].children
            .length == "1"
        ) {
          if (ietsTegenGekomen == true && xRayKoning == false) {
            p = i;
            i = 7;

            if (
              chessboard.children[rowPiece - p].children[columnPiece - p]
                .children[0].classList[1] == "king" &&
              dezeMove.classList[0] ==
                chessboard.children[rowPiece - p].children[columnPiece - p]
                  .children[0].classList[0]
            ) {
              i = 1;
              xRayKoning = true;
            }
          }
          ietsTegenGekomen = true;
        }
      }
    }
    ietsTegenGekomen = false;
    xRayKoning = false;
    raaktKoning = false;

    enemyOnderAttack = document.querySelectorAll(".enemyAttack");

    for (let u = 0; u < enemyOnderAttack.length; u++) {
      if (enemyOnderAttack[u].children.length == "1") {
        if (
          enemyOnderAttack[u].children[0].classList[1] == "king" &&
          dezeMove.classList[0] == enemyOnderAttack[u].children[0].classList[0]
        ) {
          piece.parentElement.classList.add("pieceAttackingKing");
        }
      }
    }
  }
  // ***********
  // Einde bishop / queen
  // ***********

  // ***********
  // Begin king
  // ***********

  if (piece.classList[1] == "king") {
    if (rowPiece != "0") {
      chessboard.children[rowPiece - 1].children[columnPiece].classList.add(
        "enemyAttack"
      );
      if (columnPiece != "0") {
        chessboard.children[rowPiece - 1].children[
          columnPiece - 1
        ].classList.add("enemyAttack");
      }
      if (columnPiece != "7") {
        chessboard.children[rowPiece - 1].children[
          +columnPiece + 1
        ].classList.add("enemyAttack");
      }
    }
    if (columnPiece != "0") {
      chessboard.children[rowPiece].children[columnPiece - 1].classList.add(
        "enemyAttack"
      );
    }

    if (columnPiece != "7") {
      chessboard.children[rowPiece].children[+columnPiece + 1].classList.add(
        "enemyAttack"
      );
    }

    if (rowPiece != "7") {
      chessboard.children[+rowPiece + 1].children[columnPiece].classList.add(
        "enemyAttack"
      );
      if (columnPiece != "0") {
        chessboard.children[+rowPiece + 1].children[
          columnPiece - 1
        ].classList.add("enemyAttack");
      }
      if (columnPiece != "7") {
        chessboard.children[+rowPiece + 1].children[
          +columnPiece + 1
        ].classList.add("enemyAttack");
      }
    }
  }

  // ***********
  // Einde king
  // ***********

  // ***********
  // Begin horse
  // ***********

  if (piece.classList[1] == "knight") {
    if (rowPiece != "0" && rowPiece != "1") {
      if (columnPiece != "0") {
        chessboard.children[rowPiece - 2].children[
          columnPiece - 1
        ].classList.add("enemyAttack");
      }

      if (columnPiece != "7") {
        chessboard.children[rowPiece - 2].children[
          +columnPiece + 1
        ].classList.add("enemyAttack");
      }
    }

    if (rowPiece != "0") {
      if (columnPiece != "0" && columnPiece != "1") {
        chessboard.children[rowPiece - 1].children[
          columnPiece - 2
        ].classList.add("enemyAttack");
      }

      if (columnPiece != "6" && columnPiece != "7") {
        chessboard.children[rowPiece - 1].children[
          +columnPiece + 2
        ].classList.add("enemyAttack");
      }
    }

    if (rowPiece != "6" && rowPiece != "7") {
      if (columnPiece != "0") {
        chessboard.children[+rowPiece + 2].children[
          columnPiece - 1
        ].classList.add("enemyAttack");
      }

      if (columnPiece != "7") {
        chessboard.children[+rowPiece + 2].children[
          +columnPiece + 1
        ].classList.add("enemyAttack");
      }
    }

    if (rowPiece != "7") {
      if (columnPiece != "0" && columnPiece != "1") {
        chessboard.children[+rowPiece + 1].children[
          columnPiece - 2
        ].classList.add("enemyAttack");
      }

      if (columnPiece != "6" && columnPiece != "7") {
        chessboard.children[+rowPiece + 1].children[
          +columnPiece + 2
        ].classList.add("enemyAttack");
      }
    }
  }
  enemyOnderAttack = document.querySelectorAll(".enemyAttack");

  for (let u = 0; u < enemyOnderAttack.length; u++) {
    if (enemyOnderAttack[u].children.length == "1") {
      if (
        enemyOnderAttack[u].children[0].classList[1] == "king" &&
        dezeMove.classList[0] == enemyOnderAttack[u].children[0].classList[0]
      ) {
        piece.parentElement.classList.add("pieceAttackingKing");
      }
    }
  }
}
// ***********
// Einde horse
// ***********

function checkOfCastlenMag(event) {
  if (checkInProgress == false) {
    checkInProgress = true;

    if (
      event.target.classList[0] == "white" &&
      event.target.parentElement ==
        chessboard.children[7].children[4].children[0]
    ) {
      moves = document.querySelectorAll(".possibleMove");
      for (let i = 0; i < moves.length; i++) {
        moves[i].classList.remove("possibleMove");
      }
      // Dit checkt of iets de lijn van jou king naar je rook kan zien
      for (let i = 0; i < piecesBlack.length; i++) {
        aanZet = "black";
        piecesBlack[i].click();
        if (
          chessboard.children[7].children[4].classList[1] == "possibleMove" ||
          chessboard.children[7].children[5].classList[1] == "possibleMove" ||
          chessboard.children[7].children[6].classList[1] == "possibleMove" ||
          chessboard.children[7].children[7].classList[1] == "possibleMove"
        ) {
          rightWhiteRookMoved = true;
        }

        if (
          chessboard.children[7].children[0].classList[1] == "possibleMove" ||
          chessboard.children[7].children[1].classList[1] == "possibleMove" ||
          chessboard.children[7].children[2].classList[1] == "possibleMove" ||
          chessboard.children[7].children[3].classList[1] == "possibleMove" ||
          chessboard.children[7].children[4].classList[1] == "possibleMove"
        ) {
          leftWhiteRookMoved = true;
        }
      }

      aanZet = "white";
      moves = document.querySelectorAll(".possibleMove");
      for (let i = 0; i < moves.length; i++) {
        moves[i].classList.remove("possibleMove");
      }
      chessboard.children[7].children[4].children[0].click();
    }

    if (
      event.target.classList[0] == "black" &&
      event.target.parentElement ==
        chessboard.children[0].children[4].children[0]
    ) {
      moves = document.querySelectorAll(".possibleMove");
      for (let i = 0; i < moves.length; i++) {
        moves[i].classList.remove("possibleMove");
      }

      // Dit checkt of iets de lijn van jou king naar je rook kan zien
      for (let i = 0; i < piecesWhite.length; i++) {
        aanZet = "white";
        piecesWhite[i].click();
        if (
          chessboard.children[0].children[4].classList[1] == "possibleMove" ||
          chessboard.children[0].children[5].classList[1] == "possibleMove" ||
          chessboard.children[0].children[6].classList[1] == "possibleMove" ||
          chessboard.children[0].children[7].classList[1] == "possibleMove"
        ) {
          rightBlackRookMoved = true;
        }

        if (
          chessboard.children[0].children[0].classList[1] == "possibleMove" ||
          chessboard.children[0].children[1].classList[1] == "possibleMove" ||
          chessboard.children[0].children[2].classList[1] == "possibleMove" ||
          chessboard.children[0].children[3].classList[1] == "possibleMove" ||
          chessboard.children[0].children[4].classList[1] == "possibleMove"
        ) {
          leftBlackRookMoved = true;
        }
      }

      aanZet = "black";
      moves = document.querySelectorAll(".possibleMove");
      for (let i = 0; i < moves.length; i++) {
        moves[i].classList.remove("possibleMove");
      }
      chessboard.children[0].children[4].children[0].click();
    }

    checkInProgress = false;
  }
}

function checkCheckMate() {
  let piecesWhite = document.querySelectorAll(
    "main > div > div > div > .white"
  );

  let piecesBlack = document.querySelectorAll(
    "main > div > div > div > .black"
  );

  checkInProgress = true;
  let userColorCopy = userColor;
  userColor = aanZet;

  if (aanZet == "black") {
    // Dit kijkt of je king wordt aangevallen
    for (let i = 0; i < piecesBlack.length; i++) {
      if (piecesBlack[i].classList[1] == "king") {
        piecesBlack[i].click();
        for (let y = 0; y < alleBlokjes.length; y++) {
          for (let t = 0; t < alleBlokjes[y].classList.length; t++) {
            if (alleBlokjes[y].classList[t] == "pieceAttackingKing") {
              attackBestaat = true;
            }
          }
        }
      }
    }

    checkMateNietMogelijk = false;
    moves = document.querySelectorAll(".possibleMove");
    if (attackBestaat == true) {
      // Dit kijkt of je king ergens heen kan
      if (moves.length != "0") {
        checkMateNietMogelijk = true;
      }
      // Dit kijkt of je pieces kunnen slaan of blokken
      for (let i = 0; i < piecesBlack.length; i++) {
        piecesBlack[i].click();
        moves = document.querySelectorAll(".possibleMove");
        if (moves.length >= 1) {
          checkMateNietMogelijk = true;
        }
      }
    }
    // Als beide boven niet waar zijn sta je checkmate
    if (attackBestaat == true && checkMateNietMogelijk == false) {
      winScreen.classList.add("showPopup");
      winText.innerHTML = "White wins by checkmate";
    }
  } else {
    // Dit kijkt of je king wordt aangevallen

    for (let i = 0; i < piecesWhite.length; i++) {
      if (piecesWhite[i].classList[1] == "king") {
        piecesWhite[i].click();
        for (let y = 0; y < alleBlokjes.length; y++) {
          for (let t = 0; t < alleBlokjes[y].classList.length; t++) {
            if (alleBlokjes[y].classList[t] == "pieceAttackingKing") {
              attackBestaat = true;
            }
          }
        }
      }
    }

    checkMateNietMogelijk = false;
    moves = document.querySelectorAll(".possibleMove");

    if (attackBestaat == true) {
      // Dit kijkt of je king ergens heen kan

      if (moves.length != "0") {
        checkMateNietMogelijk = true;
      }

      // Dit kijkt of je pieces kunnen slaan of blokken

      for (let i = 0; i < piecesWhite.length; i++) {
        piecesWhite[i].click();
        moves = document.querySelectorAll(".possibleMove");
        if (moves.length >= 1) {
          checkMateNietMogelijk = true;
        }
      }
    }
    // Als beide boven niet waar zijn sta je checkmate
    if (attackBestaat == true && checkMateNietMogelijk == false) {
      winScreen.classList.add("showPopup");
      winText.innerHTML = "Black wins by checkmate";
    }
  }
  userColor = userColorCopy;
  checkInProgress = false;
  checkMateNietMogelijk = false;
}

function selectPiece(event) {
  // Dit gebeurt er als je een zet doet
  let slag = event.target.parentElement;

  let rowPiece = event.target.parentElement.parentElement.className;

  let columnPiece = event.target.parentElement.classList[0];

  alleBlokjes = document.querySelectorAll("main > div > div > div");

  if (
    (event.target.classList[0] === "black" ||
      event.target.classList[0] === "white") &&
    event.target.classList[0] === aanZet
  ) {
    activePiece = event.target;
  }
  moveAllowed = true;

  // Dit is als je een pawn of piecebeweegt
  if (
    event.target.classList[1] == "possibleMove" ||
    event.target.classList[2] == "possibleMove" ||
    event.target.classList[3] == "possibleMove" ||
    event.target.parentElement.classList[1] == "possibleMove" ||
    event.target.parentElement.classList[2] == "possibleMove" ||
    event.target.parentElement.classList[3] == "possibleMove"
  ) {
    // Dit haalt last move weg
    for (let i = 0; i < alleBlokjes.length; i++) {
      alleBlokjes[i].classList.remove("lastMove");
      alleBlokjes[i].classList.remove("enemyAttack");
      alleBlokjes[i].classList.remove("pieceAttackingKing");
      alleBlokjes[i].classList.remove("padNaarKoning");
      alleBlokjes[i].classList.remove("xRayNaarKoning");
    }

    attackBestaat = false;
    pinBestaat = false;

    currentPiece.parentElement.classList.add("lastMove");

    allePieces = document.querySelectorAll("main > div > div > div > img");

    // Dit haalt alle en passant weg
    for (let i = 0; i < allePieces.length; i++) {
      if (allePieces[i].classList.length == "3") {
        allePieces[i].classList.remove("enPassantMogelijk");
      }
    }

    pawnEersteStap = false;

    if (event.target.classList[1] == "possibleMove") {
      // Dit kijkt of de pawn zijn eerste stap zet
      if (
        currentPiece.parentElement.parentElement.classList[0] == "6" &&
        currentPiece.classList[1] == "pawn"
      ) {
        pawnEersteStap = true;
      }
      if (
        currentPiece.parentElement.parentElement.classList[0] == "1" &&
        currentPiece.classList[1] == "pawn"
      ) {
        pawnEersteStap = true;
      }

      // dit zorgt ervoor dat als je enpassant je de pawn achter je ook echt slaat
      if (
        event.target.classList[2] == "enemyMove" &&
        event.target.children.length == "0" &&
        activePiece.classList[1] == "pawn"
      ) {
        if (aanZet == "white") {
          node = document.createElement("LI");
          node.appendChild(
            chessboard.children[3].children[event.target.classList[0]]
              .children[0]
          );
          verlorenPiecesBlack.appendChild(node);
        } else if (
          event.target.classList[2] == "enemyMove" &&
          event.target.children.length == "0" &&
          activePiece.classList[1] == "pawn"
        ) {
          node = document.createElement("LI");
          node.appendChild(
            chessboard.children[4].children[event.target.classList[0]]
              .children[0]
          );
          verlorenPiecesWhite.appendChild(node);
        }
      }

      // Dit zorgt ervoor dat de king kan castlen
      if (activePiece.classList[1] == "king") {
        // Dit is castlen naar rechts
        if (
          event.target.classList[2] == "enemyMove" &&
          event.target.children.length == "0"
        ) {
          if (event.target.classList[0] == "6") {
            event.target.parentElement.children[5].appendChild(
              event.target.parentElement.children[7].children[0]
            );
          }

          if (event.target.classList[0] == "2") {
            event.target.parentElement.children[3].appendChild(
              event.target.parentElement.children[0].children[0]
            );
          }
        }

        // Dit kijkt of de king al bewogen heeft
        if (activePiece.classList[0] == "white") {
          whiteKingMoved = true;
        } else {
          blackKingMoved = true;
        }
      }

      // Dit kijkt of de rooks al bewogen hebben
      if (activePiece.classList[1] == "rook") {
        if (activePiece.classList[0] == "white") {
          if (activePiece.parentElement.classList[0] == "7") {
            rightWhiteRookMoved = true;
          } else if (activePiece.parentElement.classList[0] == "0") {
            leftWhiteRookMoved = true;
          }
        } else {
          if (activePiece.parentElement.classList[0] == "7") {
            rightBlackRookMoved = true;
          } else if (activePiece.parentElement.classList[0] == "0") {
            leftBlackRookMoved = true;
          }
        }
      }

      // Dit beweegt de piece of pawn
      event.target.appendChild(activePiece);
      event.target.classList.add("lastMove");

      // Dit kijkt of je 2 stappen naar voren zet
      if (
        currentPiece.parentElement.parentElement.classList[0] == [4] &&
        pawnEersteStap == true
      ) {
        currentPiece.classList.add("enPassantMogelijk");
      }

      if (
        currentPiece.parentElement.parentElement.classList[0] == [3] &&
        pawnEersteStap == true
      ) {
        currentPiece.classList.add("enPassantMogelijk");
      }
    }

    // Dit kijkt of je iets slaat
    if (event.target.parentElement.classList[1] == "possibleMove") {
      slag.appendChild(activePiece);

      activePiece.parentElement.classList.add("lastMove");

      moveAllowed = false;

      // Dit zorgt ervoor dat als je iets slaat het onder of boven het bord komt te staan

      if (aanZet == "white") {
        node = document.createElement("LI");
        node.appendChild(event.target);
        verlorenPiecesBlack.appendChild(node);
      } else {
        node = document.createElement("LI");
        node.appendChild(event.target);
        verlorenPiecesWhite.appendChild(node);
      }

      // Dit kijkt of er iemand wint
      if (event.target.classList[1] == "king") {
        winScreen.classList.add("showPopup");

        if (aanZet == "white") {
          winText.innerHTML = "White wins";
        } else {
          winText.innerHTML = "Black wins";
        }
      }
    }

    // Dit verandert wie er aan zet is
    if (aanZet == "white") {
      aanZet = "black";
    } else {
      aanZet = "white";
    }

    piecesWhite = document.querySelectorAll("main > div > div > div > .white");

    piecesBlack = document.querySelectorAll("main > div > div > div > .black");

    checkCheckMate();

    // EMIT TO SOCKET
    socket.emit("start timer", room);

    socket.emit("move", {
      main: main.innerHTML,
      aanZet,
      room,
      username,
      secondeWhite,
      minutenWhite,
      secondeBlack,
      minutenBlack,
    });
  }

  piecesBlack = document.querySelectorAll("main > div > div > div > .black");

  piecesWhite = document.querySelectorAll("main > div > div > div > .white");

  // Dit zorgt ervoor dat als je ergens anders klikt de mogelijke zetten weg gaan
  for (let i = 0; i < alleBlokjes.length; i++) {
    alleBlokjes[i].classList.remove("possibleMove");
    alleBlokjes[i].classList.remove("enemyMove");
  }

  // Dit checkt wie er aan de beurt is
  if (
    aanZet == event.target.classList[0] &&
    moveAllowed == true &&
    aanZet == userColor
  ) {
    activePiece = event.target;

    currentPiece = slag.children[0];

    // ***********
    // Begin white Pawn
    // ***********

    if (
      currentPiece.classList[0] == "white" &&
      currentPiece.classList[1] == "pawn"
    ) {
      if (columnPiece != 0) {
        if (
          chessboard.children[rowPiece].children[columnPiece - 1].innerHTML !=
          ""
        ) {
          if (
            chessboard.children[rowPiece].children[columnPiece - 1].children[0]
              .classList[2] == "enPassantMogelijk"
          ) {
            chessboard.children[rowPiece - 1].children[
              columnPiece - 1
            ].classList.add("possibleMove");
            chessboard.children[rowPiece - 1].children[
              columnPiece - 1
            ].classList.add("enemyMove");
          }
        }
      }

      if (columnPiece != 7) {
        if (
          chessboard.children[rowPiece].children[+columnPiece + 1].innerHTML !=
          ""
        ) {
          if (
            chessboard.children[rowPiece].children[+columnPiece + 1].children[0]
              .classList[2] == "enPassantMogelijk"
          ) {
            chessboard.children[rowPiece - 1].children[
              +columnPiece + 1
            ].classList.add("possibleMove");
            chessboard.children[rowPiece - 1].children[
              +columnPiece + 1
            ].classList.add("enemyMove");
          }
        }
      }

      if (rowPiece == "0") {
        currentPiece.parentElement.innerHTML =
          '<img src="images/whiteQueen.png" alt="white queen" class="white queen">';
      } else {
        // Dit is 1 stap vooruit document
        if (
          chessboard.children[rowPiece - 1].children[columnPiece].innerHTML ==
          ""
        ) {
          chessboard.children[rowPiece - 1].children[columnPiece].classList.add(
            "possibleMove"
          );
        }
        // Dit is het mogen doen van 2 stappen op je eerste stap
        if (
          currentPiece.parentElement.parentElement.className == "6" &&
          chessboard.children[rowPiece - 2].children[columnPiece].innerHTML ==
            ""
        ) {
          chessboard.children[rowPiece - 2].children[columnPiece].classList.add(
            "possibleMove"
          );
        }
        // Dit is je slaan rechts
        if (columnPiece != 7) {
          if (
            chessboard.children[rowPiece - 1].children[+columnPiece + 1]
              .innerHTML !== ""
          ) {
            chessboard.children[rowPiece - 1].children[
              +columnPiece + 1
            ].classList.add("possibleMove");
          }
        }

        // Dit is slaan links
        if (columnPiece != 0) {
          if (
            chessboard.children[rowPiece - 1].children[columnPiece - 1]
              .innerHTML !== ""
          ) {
            chessboard.children[rowPiece - 1].children[
              columnPiece - 1
            ].classList.add("possibleMove");
          }
        }
      }
    }

    // ***********
    // Einde white Pawn
    // ***********

    // ***********
    // Begin black Pawn
    // ***********

    if (
      currentPiece.classList[0] == "black" &&
      currentPiece.classList[1] == "pawn"
    ) {
      if (columnPiece != 0) {
        if (
          chessboard.children[rowPiece].children[columnPiece - 1].innerHTML !=
          ""
        ) {
          if (
            chessboard.children[rowPiece].children[columnPiece - 1].children[0]
              .classList[2] == "enPassantMogelijk"
          ) {
            chessboard.children[+rowPiece + 1].children[
              columnPiece - 1
            ].classList.add("possibleMove");
            chessboard.children[+rowPiece + 1].children[
              columnPiece - 1
            ].classList.add("enemyMove");
          }
        }
      }

      if (columnPiece != 7) {
        if (
          chessboard.children[rowPiece].children[+columnPiece + 1].innerHTML !=
          ""
        ) {
          if (
            chessboard.children[rowPiece].children[+columnPiece + 1].children[0]
              .classList[2] == "enPassantMogelijk"
          ) {
            chessboard.children[+rowPiece + 1].children[
              +columnPiece + 1
            ].classList.add("possibleMove");
            chessboard.children[+rowPiece + 1].children[
              +columnPiece + 1
            ].classList.add("enemyMove");
          }
        }
      }

      if (rowPiece == "7") {
        currentPiece.parentElement.innerHTML =
          '<img src="images/blackQueen.png" alt="black queen" class="black queen">';
      } else {
        // Dit is 1 stap vooruit document
        if (
          chessboard.children[+rowPiece + 1].children[columnPiece].innerHTML ==
          ""
        ) {
          chessboard.children[+rowPiece + 1].children[
            columnPiece
          ].classList.add("possibleMove");
        }
        // Dit is het mogen doen van 2 stappen op je eerste stap
        if (
          currentPiece.parentElement.parentElement.className == "1" &&
          chessboard.children[+rowPiece + 2].children[columnPiece].innerHTML ==
            ""
        ) {
          chessboard.children[+rowPiece + 2].children[
            columnPiece
          ].classList.add("possibleMove");
        }
        // Dit is je slaan rechts
        if (columnPiece != 7) {
          if (
            chessboard.children[+rowPiece + 1].children[+columnPiece + 1]
              .innerHTML !== ""
          ) {
            chessboard.children[+rowPiece + 1].children[
              +columnPiece + 1
            ].classList.add("possibleMove");
          }
        }

        // Dit is slaan links
        if (columnPiece != 0) {
          if (
            chessboard.children[+rowPiece + 1].children[columnPiece - 1]
              .innerHTML !== ""
          ) {
            chessboard.children[+rowPiece + 1].children[
              columnPiece - 1
            ].classList.add("possibleMove");
          }
        }
      }
    }

    // ***********
    // Einde black Pawn
    // ***********

    // ***********
    // Begin rook / begin queen
    // ***********

    if (
      event.target.classList[1] == "rook" ||
      event.target.classList[1] == "queen"
    ) {
      // Dit is voor de rook naar rechts
      for (let i = +columnPiece + 1; i <= 7; i++) {
        chessboard.children[rowPiece].children[i].classList.add("possibleMove");

        if (chessboard.children[rowPiece].children[i].children.length == "1") {
          i = 7;
        }
      }

      // // Dit is voor de rook naar linkst
      for (let i = columnPiece - 1; i >= 0; i--) {
        chessboard.children[rowPiece].children[i].classList.add("possibleMove");

        if (chessboard.children[rowPiece].children[i].children.length == "1") {
          i = 0;
        }
      }

      // Dit is voor omhoog

      for (let i = rowPiece - 1; i >= 0; i--) {
        chessboard.children[i].children[columnPiece].classList.add(
          "possibleMove"
        );

        if (
          chessboard.children[i].children[columnPiece].children.length == "1"
        ) {
          i = 0;
        }
      }

      // Dit is voor omlaag

      for (let i = +rowPiece + 1; i <= 7; i++) {
        chessboard.children[i].children[columnPiece].classList.add(
          "possibleMove"
        );

        if (
          chessboard.children[i].children[columnPiece].children.length == "1"
        ) {
          i = 7;
        }
      }
    }
    // ***********
    // Einde Rook
    // ***********

    // ***********
    // Begin bishop
    // ***********
    if (
      event.target.classList[1] == "bishop" ||
      event.target.classList[1] == "queen"
    ) {
      // Dit is voor de bishop naar rechtsboven
      for (let i = 1; i <= 7; i++) {
        if (rowPiece - i >= "0" && +columnPiece + i <= "7") {
          chessboard.children[rowPiece - i].children[
            +columnPiece + i
          ].classList.add("possibleMove");

          if (
            chessboard.children[rowPiece - i].children[+columnPiece + i]
              .children.length == "1"
          ) {
            i = 7;
          }
        }
      }

      // Dit is voor de bishop naar rechtsonder
      for (let i = 1; i <= 7; i++) {
        if (+rowPiece + i <= "7" && +columnPiece + i <= "7") {
          chessboard.children[+rowPiece + i].children[
            +columnPiece + i
          ].classList.add("possibleMove");

          if (
            chessboard.children[+rowPiece + i].children[+columnPiece + i]
              .children.length == "1"
          ) {
            i = 7;
          }
        }
      }

      // Dit is voor de bishop naar linksonder
      for (let i = 1; i <= 7; i++) {
        if (+rowPiece + i <= "7" && columnPiece - i >= "0") {
          chessboard.children[+rowPiece + i].children[
            columnPiece - i
          ].classList.add("possibleMove");

          if (
            chessboard.children[+rowPiece + i].children[columnPiece - i]
              .children.length == "1"
          ) {
            i = 7;
          }
        }
      }

      // Dit is voor de bishop naar linksboven

      for (let i = 1; i <= 7; i++) {
        if (rowPiece - i >= "0" && columnPiece - i >= "0") {
          chessboard.children[rowPiece - i].children[
            columnPiece - i
          ].classList.add("possibleMove");

          if (
            chessboard.children[rowPiece - i].children[columnPiece - i].children
              .length == "1"
          ) {
            i = 7;
          }
        }
      }
    }
    // ***********
    // Einde bishop / queen
    // ***********

    // ***********
    // Begin king
    // ***********

    if (event.target.classList[1] == "king") {
      if (rowPiece != "0") {
        chessboard.children[rowPiece - 1].children[columnPiece].classList.add(
          "possibleMove"
        );
        if (columnPiece != "0") {
          chessboard.children[rowPiece - 1].children[
            columnPiece - 1
          ].classList.add("possibleMove");
        }
        if (columnPiece != "7") {
          chessboard.children[rowPiece - 1].children[
            +columnPiece + 1
          ].classList.add("possibleMove");
        }
      }
      if (columnPiece != "0") {
        chessboard.children[rowPiece].children[columnPiece - 1].classList.add(
          "possibleMove"
        );
      }

      if (columnPiece != "7") {
        chessboard.children[rowPiece].children[+columnPiece + 1].classList.add(
          "possibleMove"
        );
      }

      if (rowPiece != "7") {
        chessboard.children[+rowPiece + 1].children[columnPiece].classList.add(
          "possibleMove"
        );
        if (columnPiece != "0") {
          chessboard.children[+rowPiece + 1].children[
            columnPiece - 1
          ].classList.add("possibleMove");
        }
        if (columnPiece != "7") {
          chessboard.children[+rowPiece + 1].children[
            +columnPiece + 1
          ].classList.add("possibleMove");
        }
      }

      if (activePiece.classList[0] == "white" && whiteKingMoved == false) {
        // King naar rechts castlen voor white
        for (let i = +columnPiece + 1; i <= 7; i++) {
          if (
            chessboard.children[rowPiece].children[i].children.length == "1"
          ) {
            if (
              chessboard.children[rowPiece].children[i].children[0]
                .classList[1] == "rook"
            ) {
              if (rightWhiteRookMoved == false) {
                chessboard.children[rowPiece].children[i - 1].classList.add(
                  "possibleMove"
                );
                chessboard.children[rowPiece].children[i - 1].classList.add(
                  "enemyMove"
                );
              }
            }
          }
          if (
            chessboard.children[rowPiece].children[i].children.length == "1"
          ) {
            i = 7;
          }
        }

        // King naar links castlen voor white
        for (let i = columnPiece - 1; i >= 0; i--) {
          if (
            chessboard.children[rowPiece].children[i].children.length == "1"
          ) {
            if (
              chessboard.children[rowPiece].children[i].children[0]
                .classList[1] == "rook"
            ) {
              if (leftWhiteRookMoved == false) {
                chessboard.children[rowPiece].children[+i + 2].classList.add(
                  "possibleMove"
                );
                chessboard.children[rowPiece].children[+i + 2].classList.add(
                  "enemyMove"
                );
              }
            }
          }
          if (
            chessboard.children[rowPiece].children[i].children.length == "1"
          ) {
            i = 0;
          }
        }

        if (checkInProgress == false) {
          checkOfCastlenMag(event);
        }
      }

      if (activePiece.classList[0] == "black" && blackKingMoved == false) {
        // King naar rechts castlen voor black
        for (let i = +columnPiece + 1; i <= 7; i++) {
          if (
            chessboard.children[rowPiece].children[i].children.length == "1"
          ) {
            if (
              chessboard.children[rowPiece].children[i].children[0]
                .classList[1] == "rook"
            ) {
              if (rightBlackRookMoved == false) {
                chessboard.children[rowPiece].children[i - 1].classList.add(
                  "possibleMove"
                );
                chessboard.children[rowPiece].children[i - 1].classList.add(
                  "enemyMove"
                );
              }
            }
          }
          if (
            chessboard.children[rowPiece].children[i].children.length == "1"
          ) {
            i = 7;
          }
        }

        // King naar links castlen voor black
        for (let i = columnPiece - 1; i >= 0; i--) {
          if (
            chessboard.children[rowPiece].children[i].children.length == "1"
          ) {
            if (
              chessboard.children[rowPiece].children[i].children[0]
                .classList[1] == "rook"
            ) {
              if (leftBlackRookMoved == false) {
                chessboard.children[rowPiece].children[+i + 2].classList.add(
                  "possibleMove"
                );
                chessboard.children[rowPiece].children[+i + 2].classList.add(
                  "enemyMove"
                );
              }
            }
          }
          if (
            chessboard.children[rowPiece].children[i].children.length == "1"
          ) {
            i = 0;
          }
        }
        if (checkInProgress == false) {
          checkOfCastlenMag(event);
        }
      }
    }

    // ***********
    // Einde king
    // ***********

    // ***********
    // Begin horse
    // ***********

    if (event.target.classList[1] == "knight") {
      if (rowPiece != "0" && rowPiece != "1") {
        if (columnPiece != "0") {
          chessboard.children[rowPiece - 2].children[
            columnPiece - 1
          ].classList.add("possibleMove");
        }

        if (columnPiece != "7") {
          chessboard.children[rowPiece - 2].children[
            +columnPiece + 1
          ].classList.add("possibleMove");
        }
      }

      if (rowPiece != "0") {
        if (columnPiece != "0" && columnPiece != "1") {
          chessboard.children[rowPiece - 1].children[
            columnPiece - 2
          ].classList.add("possibleMove");
        }

        if (columnPiece != "6" && columnPiece != "7") {
          chessboard.children[rowPiece - 1].children[
            +columnPiece + 2
          ].classList.add("possibleMove");
        }
      }

      if (rowPiece != "6" && rowPiece != "7") {
        if (columnPiece != "0") {
          chessboard.children[+rowPiece + 2].children[
            columnPiece - 1
          ].classList.add("possibleMove");
        }

        if (columnPiece != "7") {
          chessboard.children[+rowPiece + 2].children[
            +columnPiece + 1
          ].classList.add("possibleMove");
        }
      }

      if (rowPiece != "7") {
        if (columnPiece != "0" && columnPiece != "1") {
          chessboard.children[+rowPiece + 1].children[
            columnPiece - 2
          ].classList.add("possibleMove");
        }

        if (columnPiece != "6" && columnPiece != "7") {
          chessboard.children[+rowPiece + 1].children[
            +columnPiece + 2
          ].classList.add("possibleMove");
        }
      }
    }

    // ***********
    // Einde horse
    // ***********

    // Dit zorgt ervoor dat je je eigen dingen niet kan slaan

    mogelijkeMoves = document.querySelectorAll(".possibleMove");

    dezeMove = event.target;

    let alleEnemyAttacks = document.querySelectorAll(".enemyAttack");

    for (let i = 0; i < alleEnemyAttacks.length; i++) {
      alleEnemyAttacks[i].classList.remove("enemyAttack");
    }
    // Dit zorgt dat je je eigen dingen niet kan slaan voor white
    if (activePiece.classList[0] == "white") {
      for (let i = 0; i < mogelijkeMoves.length; i++) {
        if (mogelijkeMoves[i].children.length != "0") {
          if (mogelijkeMoves[i].children[0].classList[0] == "white") {
            mogelijkeMoves[i].classList.remove("possibleMove");
          }
        }
      }

      // Dit zorgt ervoor dat als het een enemy is je een andere icoon krijgt
      for (let i = 0; i < mogelijkeMoves.length; i++) {
        if (mogelijkeMoves[i].children.length != "0") {
          if (mogelijkeMoves[i].children[0].classList[0] == "black") {
            mogelijkeMoves[i].classList.add("enemyMove");
          }
        }
      }

      // Dit kijkt of de move mogelijk is doordat je geen illegaale moves mag maken
      for (let i = 0; i < piecesBlack.length; i++) {
        movePossible(piecesBlack[i]);
      }
    }

    // Dit zorgt dat je je eigen dingen niet kan slaan voor black
    if (activePiece.classList[0] == "black") {
      for (let i = 0; i < mogelijkeMoves.length; i++) {
        if (mogelijkeMoves[i].children.length != "0") {
          if (mogelijkeMoves[i].children[0].classList[0] == "black") {
            mogelijkeMoves[i].classList.remove("possibleMove");
          }
        }
      }

      // Dit zorgt ervoor dat als het een enemy is je een andere icoon krijgt
      for (let i = 0; i < mogelijkeMoves.length; i++) {
        if (mogelijkeMoves[i].children.length != "0") {
          if (mogelijkeMoves[i].children[0].classList[0] == "white") {
            mogelijkeMoves[i].classList.add("enemyMove");
          }
        }
      }

      // Dit kijkt of de move mogelijk is doordat je geen illegaale moves mag maken
      for (let i = 0; i < piecesWhite.length; i++) {
        movePossible(piecesWhite[i]);
      }
    }

    // Dit zorgt dat de king niet ergens heen kan dat een enemy piece of pawn kan zien
    if (activePiece.classList[1] == "king") {
      moves = document.querySelectorAll(".possibleMove");
      for (let i = 0; i < moves.length; i++) {
        for (let u = 0; u < moves[i].classList.length; u++) {
          if (
            moves[i].classList[u] == "enemyAttack" ||
            moves[i].classList[u] == "padNaarKoning"
          ) {
            moves[i].classList.remove("possibleMove");
            moves[i].classList.remove("enemyMove");
          }
        }
      }
    }

    // Dit checkt of je schaak staat
    if (activePiece.classList[1] != "king") {
      for (let i = 0; i < alleBlokjes.length; i++) {
        for (let u = 0; u < alleBlokjes[i].classList.length; u++) {
          if (alleBlokjes[i].classList[u] == "pieceAttackingKing") {
            attackBestaat = true;
            i = alleBlokjes.length - 1;
          }
        }
      }

      // Dit zorgt ervoor dat als je schaak staat je moet rennen of blokken
      moves = document.querySelectorAll(".possibleMove");
      if (attackBestaat == true) {
        for (let i = 0; i < moves.length; i++) {
          for (let u = 0; u < moves[i].classList.length; u++) {
            if (moves[i].classList[u] == "pieceAttackingKing") {
              moveIsGoed = true;
            }

            if (moves[i].classList[u] == "padNaarKoning") {
              moveIsGoed = true;
            }
          }
          if (moveIsGoed == false) {
            moves[i].classList.remove("possibleMove");
            moves[i].classList.remove("enemyMove");
          }
          moveIsGoed = false;
        }
      }

      // Dit zorgt dat als je pinned staat je de pawn of piece niet kan bewegen
      for (let i = 0; i < dezeMove.parentElement.classList.length; i++) {
        if (dezeMove.parentElement.classList[i] == "xRayNaarKoning") {
          pinBestaat = true;
        }
      }
      if (pinBestaat == true) {
        moves = document.querySelectorAll(".possibleMove");
        for (let i = 0; i < moves.length; i++) {
          for (let u = 0; u < moves[i].classList.length; u++) {
            if (moves[i].classList[u] == "xRayNaarKoning") {
              moveIsGoed = true;
            }
          }
          if (moveIsGoed == false) {
            moves[i].classList.remove("possibleMove");
            moves[i].classList.remove("enemyMove");
          }
          moveIsGoed = false;
        }
      }
      pinBestaat = false;
    }
  }

  moves = document.querySelectorAll(".possibleMove");

  if (aanZet == event.target.classList[0] && moveAllowed == true) {
    if (
      activePiece.parentElement.parentElement.parentElement.classList[0] ==
      "verlorenPieces"
    ) {
      for (let i = 0; i < moves.length; i++) {
        moves[i].classList.remove("possibleMove");
        moves[i].classList.remove("enemyMove");
      }
    }
  }
}

let restartKnop = document.querySelector(
  "body > section > div > button:first-of-type"
);

function restart() {
  socket.emit("reset room", { room });
}

restartKnop.addEventListener("click", restart);

let hideOverlayKnop = document.querySelector(
  "body > section > div > button:last-of-type"
);
const spectateButton = document.querySelector(".spectateButton");

function hideOverlayToggle() {
  if (roomPopup) roomPopup.classList.remove("showPopup");
  if (winScreen) winScreen.classList.remove("showPopup");
}

hideOverlayKnop.addEventListener("click", hideOverlayToggle);
if (spectateButton) {
  spectateButton.addEventListener("click", hideOverlayToggle);
}

function windowReload() {
  location.reload();
}

window.addEventListener("mouseenter", windowReload);
