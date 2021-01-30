import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "content-type": "application/json",
  },
  responseType: "json",
  withCredentials: true,
});

const refreshAuthLogic = (failedRequest) =>
  instance
    .post("refresh_token")
    .then((tokenRefreshResponse) => {
      localStorage.setItem("accessToken", tokenRefreshResponse.data.access);
      failedRequest.response.config.headers["Authorization"] =
        "Bearer " + tokenRefreshResponse.data.access;
      return Promise.resolve();
    })
    .catch((error) => {
      console.log("refresh fail");
      localStorage.setItem("accessToken", null);
      localStorage.setItem("refreshToken", null);
      //pushToLogin();
      return Promise.reject(error);
    });
createAuthRefreshInterceptor(instance, refreshAuthLogic);

export default instance;
