const express = require("express");
const cors = require("cors");
const pool = require("./connection");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("express-jwt");
const jsonwebtoken = require("jsonwebtoken");

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
// app.use(
//   session({
//     key: "userID",
//     secret: "secretKey", //change if you want to deploy
//     resave: false,
//     saveUninitialized: false,
//     cookie: { expires: 60 * 60 * 24 }, //expires in 2 hours
//   })
// );

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  const refreshToken = req.cookies.refresh_token;
  console.log("================");
  console.log(token);
  console.log("");
  console.log(refreshToken);
  console.log("================");

  //check whther token and refresh_tken exists
  //I might need to change this
  if (token === "null" && refreshToken === undefined) {
    //logout
    console.log("No Token");
    return res.send({ auth: false, message: "No Token" });
  } else {
    //verify the access_token
    console.log("masuk else");
    jsonwebtoken.verify(token, "jwtSecret", (err, decoded) => {
      if (err) {
        console.log(err);
        return res
          .status(401)
          .send({ auth: false, message: "Authentication failed" });
      }
      //pass the values
      console.log(decoded);
      req.id = decoded.id;
      req.token = token;
      req.username = decoded.username;
      next();
    });
  }
};

//Routes
app.post("/api/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.status.send({ success: false, message: "Something happened" });
    }
    const registerQuery =
      "INSERT INTO USERS (username, password) VALUES($1,$2)";
    pool.query(registerQuery, [username, hash], (err, result) => {
      if (err) {
        console.log(err);
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

  //check whether user exists or not
  const selectUserQuery = "SELECT * FROM USERS where username = $1";
  pool.query(selectUserQuery, [username], (err, result) => {
    if (err) {
      return res.send({ message: "something happened" });
    }
    //user exists
    if (result.rows.length > 0) {
      //compare password
      bcrypt.compare(password, result.rows[0].password, (err, response) => {
        if (response) {
          const id = result.rows[0].id_user;
          const username = result.rows[0].username;
          //create access_token
          const token = jsonwebtoken.sign(
            { id: id, username: username },
            "jwtSecret",
            {
              expiresIn: "15s",
            }
          );
          //create refresh_token
          const refreshToken = jsonwebtoken.sign(
            { id: id, username: username },
            "jwtSecret",
            { expiresIn: "7d" }
          );
          //insert refreshtoken to database
          const insertRefreshToken =
            "UPDATE USERS SET refresh_token = $1 WHERE id_user = $2";
          pool.query(insertRefreshToken, [refreshToken, id], (err, result) => {
            if (err) {
              console.log(err);
              return res.send("Error inserting");
            }
          });
          //send refresh_token in cookie
          res.cookie("refresh_token", refreshToken, { httpOnly: true });
          // req.session.user = result.rows[0];
          return res.send({
            auth: true,
            token: token,
            user: result.rows[0],
          });
        }
        //wrong combination
        else
          return res.send({
            auth: false,
            message: "Wrong Username/Password combination",
          });
      });
    } else {
      //user does not exists
      return res.send({ auth: false, message: "User does not exists!" });
    }
  });
});

app.get("/api/userInfo", verifyJWT, (req, res) => {
  console.log(req.id);
  const id = req.id;
  const token = req.token;
  console.log(`USEINFO TOKEN: ${token}`);
  // const username = req.username;
  const userQuery = "SELECT * FROM USERS WHERE id_user = $1";
  pool.query(userQuery, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.send({ auth: false, message: "An error has occured" });
    } else {
      const user = result.rows[0];
      return res.send({
        auth: true,
        message: "success",
        user: user,
        token: token,
      });
    }
  });
});
app.get("/api/checkAuth", verifyJWT, (req, res) => {
  const token = req.token;
  return res.send({ message: "You are authenticated", token: token });
});

app.post("/api/refresh_token", (req, res) => {
  //get refresh_token from cookie
  const refreshToken = req.cookies.refresh_token;
  console.log("REFRESH");
  console.log(refreshToken);
  console.log("");

  //verify refresh_token
  jsonwebtoken.verify(refreshToken, "jwtSecret", (err, decoded) => {
    if (err) {
      console.log(err);
      res.cookie("refresh_token", "", { httpOnly: true });
      return res.send({
        auth: false,
        message: "Authentication failed",
        token: "",
      });
    } else {
      const id = decoded.id;
      const selectUser = "SELECT * FROM USERS WHERE id_user = $1";
      //verify in db
      pool.query(selectUser, [id], (err, result) => {
        if (err) {
          console.log(err);
          return res.send({
            auth: false,
            message: "Authentication failed",
            token: "",
          });
        }
        //user exists
        if (result.rows.length > 0) {
          //create new access_token
          const new_token = jsonwebtoken.sign(
            { id: result.rows[0].id_user, username: result.rows[0].username },
            "jwtSecret",
            {
              expiresIn: "15s",
            }
          );
          console.log(`New token :  ${new_token}`);
          return res.send({ auth: true, token: new_token });
        } else {
          return res.send({
            auth: false,
            message: "Authentication failed",
            token: "",
          });
        }
      });
    }
  });
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
