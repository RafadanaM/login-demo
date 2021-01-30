import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useAuth } from "../AuthContext";
import { Redirect } from "react-router-dom";

function Landing() {
  //registration
  const [usernameReg, setUsernameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");

  //login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [messageReg, setMessageReg] = useState("");

  const { login, message, currentUser } = useAuth();

  Axios.defaults.withCredentials = true;

  const usernameRegHandler = (event) => {
    setUsernameReg(event.target.value);
  };
  const passwordRegHandler = (event) => {
    setPasswordReg(event.target.value);
  };

  const usernameHandler = (event) => {
    setUsername(event.target.value);
  };
  const passwordHandler = (event) => {
    setPassword(event.target.value);
  };

  const register = () => {
    Axios.post("http://localhost:5000/api/register", {
      username: usernameReg,
      password: passwordReg,
    }).then((res) => {
      if (res.data.success) {
        setUsernameReg("");
        setPasswordReg("");
        alert(res.data.message);
      } else {
        alert(res.data.message);
      }
    });
  };

  const loginHandler = (e) => {
    e.preventDefault();
    login(username, password);
  };

  const checkAuthentication = () => {
    // Axios.get("http://localhost:5000/api/userInfo", {
    //   headers: { "x-access-token": localStorage.getItem("token") },
    // }).then((response) => {
    //   console.log(response);
    // });
  };

  return (
    <div>
      {currentUser ? (
        <Redirect to="/home" />
      ) : (
        <div>
          <h1>Landing</h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h2>Registration</h2>
            <label>Username</label>
            <input
              type="text"
              value={usernameReg}
              onChange={usernameRegHandler}
            />
            <label>password</label>
            <input
              type="password"
              value={passwordReg}
              onChange={passwordRegHandler}
            />
            <p>{messageReg}</p>
            <button onClick={register}>Register</button>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h2>Login</h2>
            <label>Username</label>
            <input type="text" value={username} onChange={usernameHandler} />
            <label>password</label>
            <input
              type="password"
              value={password}
              onChange={passwordHandler}
            />
            <button onClick={loginHandler}>Login</button>
          </div>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

export default Landing;
