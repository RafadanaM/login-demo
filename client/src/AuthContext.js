import React, { createContext, useEffect, useState } from "react";
import axios from "./axios/config";
import createAuthRefreshInterceptor from "axios-auth-refresh";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState();

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
    // return new Promise((resolve, reject) => {
    axios
      .post("/refresh_token")
      .then((response) => {
        console.log(response.data);
        // const newToken = response.data.token;
        // setToken(newToken);
        // console.log(`NEW FUCKING TOKEN : ${newToken}`);
        //resolve(response);
      })
      .catch((err) => {
        console.log(err);
        //reject(err);
      });
    // });
  };

  // axios.interceptors.response.use(
  //   (response) => {
  //     return response;
  //   },
  //   (error) => {
  //     const originalRequest = error.config;
  //     console.log("ori request " + error.config);
  //     console.log(error.response.status);
  //     if (error.response.status === 401 && !originalRequest._retry) {
  //       originalRequest._retry = true;
  //       isRefreshing = true;
  //       console.log("pre");
  //       return refreshToken()
  //         .then((response) => {
  //           console.log("OI ");
  //           const newToken = response.data.token;
  //           setToken(newToken);
  //           console.log(`NEW TOKEN : ${newToken}`);
  //           axios.defaults.headers.common["x-access-token"] = newToken;
  //           //originalRequest.headers["x-access-token"] = newToken;
  //           return new Promise((resolve, reject) => {
  //             axios
  //               .request(originalRequest)
  //               .then((response) => {
  //                 resolve(response);
  //               })
  //               .catch((error) => {
  //                 reject(error);
  //               });
  //           });
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //           Promise.reject(err);
  //         });

  //       // return new Promise((resolve, reject) => {
  //       //   refreshToken()
  //       //     .then((tokenRefreshResponse) => {
  //       //       console.log("OI" + tokenRefreshResponse);
  //       //       const newToken = tokenRefreshResponse.data.token;
  //       //       setToken(newToken);
  //       //       console.log(`NEW FUCKING TOKEN : ${newToken}`);
  //       //       originalRequest.headers["x-access-token"] = newToken;
  //       //       processQueue(null, tokenRefreshResponse.data.token);
  //       //       setLoading(false);
  //       //       resolve(axios(originalRequest));
  //       //     })
  //       //     .catch((err) => {
  //       //       processQueue(err, null);
  //       //       reject(err);
  //       //     })
  //       //     .then(() => {
  //       //       isRefreshing = false;
  //       //     });
  //       // });
  //     }
  //     console.log("masuk false");
  //     return Promise.reject(error);
  //   }
  // );

  const refreshAuthLogic = (failedRequest) => {
    console.log("INTERCEPRTTT");
    return axios.post("/refresh_token").then((tokenRefreshResponse) => {
      console.log(`NEW FUCKING TOKEN : ${tokenRefreshResponse.data.token}`);
      failedRequest.response.config.headers["x-access-token"] =
        tokenRefreshResponse.data.token;
      axios.defaults.headers.common["x-access-token"] =
        tokenRefreshResponse.data.token;
      setToken(tokenRefreshResponse.data.token);

      return Promise.resolve();
    });
  };

  createAuthRefreshInterceptor(axios, refreshAuthLogic);

  const getUser = () => {
    axios
      .get("/userInfo")
      .then((res) => {
        console.log(res.data);
        setCurrentUser(res.data.user);

        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
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
          setToken(res.data.token);
          axios.defaults.headers.common["x-access-token"] = res.data.token;
          setCurrentUser(res.data.user);

          setMessage("");
        } else {
          setMessage(res.data.message);
        }
      });
  };

  const logout = () => {
    axios.post("/logout");
    window.location.reload();
  };

  useEffect(() => {
    getUser();
  }, []);

  const AuthContextValue = {
    currentUser,
    refreshToken,
    message,
    login,
    logout,
  };
  return (
    <AuthContext.Provider value={AuthContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
