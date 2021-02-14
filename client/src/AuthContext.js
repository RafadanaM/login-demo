import React, { createContext, useEffect, useState } from "react";
import axios from "./axios/config";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    failedQueue = [];
  };

  const refreshToken = () => {
    return new Promise((resolve, reject) => {
      axios
        .post("/refresh_token")
        .then((response) => {
          // const newToken = response.data.token;
          // setToken(newToken);
          // console.log(`NEW FUCKING TOKEN : ${newToken}`);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const originalRequest = error.config;
      console.log("ori request " + error.config);
      console.log(error.response.status);
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        isRefreshing = true;
        console.log("pre");
        return refreshToken()
          .then((response) => {
            console.log("OI ");
            const newToken = response.data.token;
            setToken(newToken);
            console.log(`NEW TOKEN : ${newToken}`);
            axios.defaults.headers.common["x-access-token"] = newToken;
            //originalRequest.headers["x-access-token"] = newToken;
            return new Promise((resolve, reject) => {
              axios
                .request(originalRequest)
                .then((response) => {
                  resolve(response);
                })
                .catch((error) => {
                  reject(error);
                });
            });
          })
          .catch((err) => {
            console.log(err);
            Promise.reject(err);
          });

        // return new Promise((resolve, reject) => {
        //   refreshToken()
        //     .then((tokenRefreshResponse) => {
        //       console.log("OI" + tokenRefreshResponse);
        //       const newToken = tokenRefreshResponse.data.token;
        //       setToken(newToken);
        //       console.log(`NEW FUCKING TOKEN : ${newToken}`);
        //       originalRequest.headers["x-access-token"] = newToken;
        //       processQueue(null, tokenRefreshResponse.data.token);
        //       setLoading(false);
        //       resolve(axios(originalRequest));
        //     })
        //     .catch((err) => {
        //       processQueue(err, null);
        //       reject(err);
        //     })
        //     .then(() => {
        //       isRefreshing = false;
        //     });
        // });
      }
      console.log("masuk false");
      return Promise.reject(error);
    }
  );

  // const refreshAuthLogic = (failedRequest) => {
  //   console.log("INTERCEPRTTT");
  //   return axios
  //     .post("http://localhost:5000/api/refresh_token")
  //     .then((tokenRefreshResponse) => {
  //       setToken(tokenRefreshResponse.data.token);
  //       console.log(`NEW FUCKING TOKEN : ${tokenRefreshResponse.data.token}`);
  //       failedRequest.response.config.headers["x-access-token"] =
  //         tokenRefreshResponse.data.token;
  //       return Promise.resolve();
  //     });
  // };

  // createAuthRefreshInterceptor(axios, refreshAuthLogic);

  const getUser = () => {
    console.log("call get user1");
    axios
      .get("/userInfo", {
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
      .post("/login", {
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
    console.log("masuk");
    if (newToken !== token) {
      console.log("set new token");
      setToken(newToken);
    }
  };

  const logout = () => {
    //setToken();
    console.log("current Token : " + token);
    //window.location.reload();
  };

  // useEffect(() => {
  //   setToken(token);
  // }, [token]);

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
    refreshToken,
  };
  return (
    <AuthContext.Provider value={AuthContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
