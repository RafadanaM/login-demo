const express = require("express");
const cors = require("cors");
const pool = require("./connection");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();
app.use(express.json());
//middleware
app.use(
  cors({
    origin: ["https://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: "userID",
    secret: "secretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { expires: 60 * 60 * 24 },
  })
);

//Routes
app.post("/api/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.send({ message: "Something happened" });
    }
    const registerQuery =
      "INSERT INTO USERS (username, password) VALUES($1,$2)";
    pool.query(registerQuery, [username, hash], (err, result) => {
      if (err) {
        if (err.code === "23505")
          return res.send({ message: "username already exists!!" });
      }
      return res.send({
        message: "registration success",
      });
    });
  });
});

app.post("/api/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const selectUserQuery = "SELECT * FROM USERS where username = $1";
  pool.query(selectUserQuery, [username], (err, result) => {
    if (err) {
      return res.send({ message: "something happened" });
    }
    if (result.rows.length > 0) {
      bcrypt.compare(password, result.rows[0].password, (err, response) => {
        if (response) {
          req.session.user = result.rows[0];
          console.log(req.session.user);
          return res.send(result.rows[0]);
        } else
          return res.send({ message: "Wrong Username/Password combination" });
      });
    } else {
      return res.send({ message: "User does not exists!" });
    }
  });
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
