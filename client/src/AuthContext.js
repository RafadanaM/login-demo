import React, { createContext, useEffect, useState } from "react";

const AuthContext = createContext({});

const AuthProvider = (props) => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {}, []);

  const AuthContextValue = {
    loggedIn,
  };
  return <AuthContext.Provider value={AuthContextValue} {...props} />;
};

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
