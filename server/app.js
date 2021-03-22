const express = require("express");
const cors = require("cors");
const pool = require("./connection");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jsonwebtoken = require("jsonwebtoken");
const auth = require("./auth");

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

//Routes

app.post("/api/logout", auth.verifyJWT, async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.send({ message: "logged out" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something happened" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, saltRounds);
    await pool.query("INSERT INTO USERS (username,password) VALUES($1,$2)", [
      username,
      hash,
    ]);
    return res.send({ status: "Success", message: "Registration success" });
  } catch (error) {
    console.log(error);
    if (error.code === "23505") {
      return res.send({ status: "Error", message: "User already exists!!" });
    }
    return res
      .status(500)
      .send({ status: "Error", message: "something happened" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const selectedUser = await pool.query(
      "SELECT * FROM USERS where username = $1",
      [username]
    );
    if (selectedUser.rowCount > 0) {
      match = await bcrypt.compare(password, selectedUser.rows[0].password);

      if (match) {
        const { id_user, username } = selectedUser.rows[0];
        //create access token
        const accessToken = jsonwebtoken.sign(
          { id: id_user, username: username },
          "jwtSecret",
          { expiresIn: "15s" }
        );
        //create refresh token
        const refreshToken = jsonwebtoken.sign(
          { id: id_user, username: username },
          "jwtSecret",
          { expiresIn: "7d" }
        );
        await pool.query(
          "UPDATE USERS SET refresh_token = $1 WHERE id_user = $2",
          [refreshToken, id_user]
        );
        // res.cookie("access_token", accessToken, { httpOnly: true });
        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
        });

        return res.send({
          status: "Success",
          auth: true,
          token: accessToken,
          user: selectedUser.rows[0],
        });
      } else {
        return res.send({
          auth: false,
          message: "Wrong username/password combination",
        });
      }
    }
    return res.send({
      status: "Success",
      auth: false,
      message: "User does not exist",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: "Error", message: "Something happened" });
  }
});

app.get("/api/userInfo", auth.verifyJWT, (req, res) => {
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
      console.log(user);
      return res.send({
        auth: true,
        message: "success",
        user: user,
        token: token,
      });
    }
  });
});
app.get("/api/checkAuth", auth.verifyJWT, (req, res) => {
  const token = req.token;
  return res.send({ message: "You are authenticated", token: token });
});

app.post("/api/refresh_token", async (req, res) => {
  //get refresh_token from cookie
  try {
    console.log(`old token: ${req.cookies.access_token}`);
    const refreshToken = req.cookies.refresh_token;
    console.log(refreshToken);
    const { id } = jsonwebtoken.verify(refreshToken, "jwtSecret");
    const user = await pool.query("SELECT * FROM USERS WHERE id_user = $1", [
      id,
    ]);
    if (user.rowCount > 0) {
      const newAccessToken = jsonwebtoken.sign(
        { id: user.rows[0].id_user, username: user.rows[0].username },
        "jwtSecret",
        {
          expiresIn: "15s",
        }
      );

      //res.cookie("access_token", newAccessToken, { httpOnly: true });
      console.log(`new token: ${newAccessToken}`);
      //add generate new refresh token or smth
      return res.send({
        status: "Success",
        message: "access token refreshed",
        token: newAccessToken,
      });
    }
    res.clearCookie("refresh_token");

    return res
      .status(500)
      .send({ status: "Error", message: "User does not exist" });
  } catch (error) {
    console.log(error);
    res.clearCookie("refresh_token");
    res.status(500).send({ status: "Error", message: "something happened" });
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
