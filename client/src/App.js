import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./AuthContext";

function App() {
  const { loggedIn } = useAuth();

  return (
    <Router>
      <Route path="/" exact render={(props) => <Landing />} />
      <ProtectedRoute path="/home" component={Home} isAuth />
    </Router>
  );
}

export default App;
