import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
//import { useAuth } from "../AuthContext";

//const { token, setNewToken } = useAuth();

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "content-type": "application/json",
  },
  responseType: "json",
  withCredentials: true,
});

// instance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async function (error) {
//     const originalRequest = error.config;
//     if (error.response.status === 403 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       //const access_token = await refreshAccessToken();
//       //axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
//       return instance(originalRequest);
//     }
//     return Promise.reject(error);
//   }
// );

// instance.interceptors.response.use(undefined, function (error) {
//   alert(error.toString());
//   return Promise.reject(error);
// });

// instance.interceptors.response.use(undefined, authInterceptor(apiClient));

// const refreshAuthLogic = (failedRequest) =>
//   instance
//     .post("refresh_token")
//     .then((tokenRefreshResponse) => {
//       localStorage.setItem("accessToken", tokenRefreshResponse.data.access);
//       failedRequest.response.config.headers["Authorization"] =
//         "Bearer " + tokenRefreshResponse.data.access;
//       return Promise.resolve();
//     })
//     .catch((error) => {
//       console.log("refresh fail");
//       localStorage.setItem("accessToken", null);
//       localStorage.setItem("refreshToken", null);
//       //pushToLogin();
//       return Promise.reject(error);
//     });
// createAuthRefreshInterceptor(instance, refreshAuthLogic);

export default instance;
