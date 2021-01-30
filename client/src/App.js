import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route exact path="/" component={Landing} />
          {/* <Route path="/home" component={Home} /> */}
          <ProtectedRoute path="/home" component={Home} />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
