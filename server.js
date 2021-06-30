/* eslint-disable no-undef */
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 8080;

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
