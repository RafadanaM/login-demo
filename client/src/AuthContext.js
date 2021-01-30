import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
axios.defaults.withCredentials = true;
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const refreshAuthLogic = (failedRequest) => {
    console.log("INTERCEPRTTT");
    return axios
      .post("http://localhost:5000/api/refresh_token")
      .then((tokenRefreshResponse) => {
        setToken(tokenRefreshResponse.data.token);
        console.log(`NEW FUCKING TOKEN : ${tokenRefreshResponse.data.token}`);
        failedRequest.response.config.headers["x-access-token"] =
          tokenRefreshResponse.data.token;
        return Promise.resolve();
      });
  };

  createAuthRefreshInterceptor(axios, refreshAuthLogic);

  const getUser = () => {
    console.log("call get user1");
    axios
      .get("http://localhost:5000/api/userInfo", {
        headers: { "x-access-token": token },
      })
      .then((response) => {
        console.log("call get user2");
        console.log(response);
        if (response.data.auth) {
          setCurrentUser(response.data.user);
          setToken(response.data.token);
        } else {
          if (response.data.message === "Authentication failed") {
            //setToken();
          }
        }
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        //setToken();
        //window.location.reload();
      });
  };

  const login = (username, password) => {
    axios
      .post("http://localhost:5000/api/login", {
        username: username,
        password: password,
      })
      .then((res) => {
        console.log(res.data);
        if (res.data.auth) {
          setCurrentUser(res.data.user);
          setToken(res.data.token);
          setMessage("");
        } else {
          setMessage(res.data.message);
        }
      });
  };

  const setNewToken = (newToken) => {
    if (newToken !== token) {
      console.log("set new token");
      setToken(newToken);
    }
  };

  const logout = () => {
    setToken();
    //window.location.reload();
  };

  useEffect(() => {
    getUser();
  }, []);

  const AuthContextValue = {
    currentUser,
    message,
    login,
    logout,
    token,
    setNewToken,
  };
  return (
    <AuthContext.Provider value={AuthContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
