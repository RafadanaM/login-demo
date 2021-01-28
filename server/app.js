const express = require("express");
const cors = require("cors");
const pool = require("./connection");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

const app = express();
app.use(express.json());
//middleware
app.use(
  cors({
    origin: "http://localhost:3000", //change if you want to deploy
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: "userID",
    secret: "secretKey", //change if you want to deploy
    resave: false,
    saveUninitialized: false,
    cookie: { expires: 60 * 60 * 24 }, //expires in 2 hours
  })
);

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.send("No Token");
  } else {
    jwt.verify(token, "jwtSecret", (err, decoded) => {
      if (err) {
        return res.send({ auth: false, message: "Authentication failed" });
      } else {
        console.log(decoded);
        req.id = decoded.id;
        req.username = decoded.username;
        next();
      }
    });
  }
};

//Routes
app.post("/api/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.send({ success: false, message: "Something happened" });
    }
    const registerQuery =
      "INSERT INTO USERS (username, password) VALUES($1,$2)";
    pool.query(registerQuery, [username, hash], (err, result) => {
      if (err) {
        if (err.code === "23505")
          return res.send({
            success: false,
            message: "username already exists!!",
          });
      }
      return res.send({
        success: true,
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
          const id = result.rows[0].id_user;
          const username = result.rows[0].username;
          const token = jwt.sign({ id: id, username: username }, "jwtSecret", {
            expiresIn: 300,
          });
          req.session.user = result.rows[0];
          return res.send({ auth: true, token: token, result: result.rows[0] });
        } else
          return res.send({ message: "Wrong Username/Password combination" });
      });
    } else {
      return res.send({ message: "User does not exists!" });
    }
  });
});

app.get("/api/userInfo", verifyJWT, (req, res) => {
  console.log(req.id);
  const id = req.id;
  const username = req.username;
  return res.send("You are authenticated");
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
