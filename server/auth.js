const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  // const token = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;
  console.log(token);
  console.log(refreshToken);

  //check whther token and refresh_tken exists
  //I might need to change this
  if (!refreshToken) {
    //logout
    console.log("No Token");
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.send({ auth: false, message: "No Token" });
  } else {
    //verify the access_token
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

module.exports = {
  verifyJWT,
};
