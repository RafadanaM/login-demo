import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import axios from "../axios/config";

function Home() {
  const { logout, currentUser, token, setNewToken, refreshToken } = useAuth();

  //const [status, setStatus] = useState();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const checkAuth = () => {
    console.log(`Token to be sent: ${token}`);
    axios
      .get("/checkAuth")
      .then((response) => {
        console.log(response.data.token);
        // setStatus(response.data);
        //setNewToken(response.data.token);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // useEffect(() => {
  //   checkAuth();
  // }, []);

  return (
    <div>
      {/* {`console  ${console.log(status)}`} */}
      <h1>Home</h1>
      <h2>Welcome {currentUser.username}</h2>
      <h2>Token: {token}</h2>
      {/* {status.map((content) => (
        <h2>{content.message}</h2>
      ))} */}
      {/* <h2>{status === undefined ? "asd" : status.message}</h2> */}

      <button onClick={checkAuth}>Check Auth</button>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={refreshToken}>refresh</button>
    </div>
  );
}

export default Home;
