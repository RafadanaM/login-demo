import React from "react";
import { useAuth } from "../AuthContext";
import axios from "axios";

axios.defaults.withCredentials = true;

function Home() {
  const { logout, currentUser, token, setNewToken } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const checkAuth = () => {
    console.log(`Token to be sent: ${token}`);
    axios
      .get("http://localhost:5000/api/checkAuth", {
        headers: { "x-access-token": token },
      })
      .then((response) => {
        console.log(response);
        setNewToken(response.data.token);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div>
      <h1>Home</h1>
      <h2>Welcome {currentUser.username}</h2>
      <h2>Token: {token}</h2>
      <button onClick={checkAuth}>Check Auth</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;
