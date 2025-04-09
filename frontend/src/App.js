import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PatSelect } from "./scenes/PatientSelect/PatSelect";
import { Dashboard } from "./scenes/Dashboard/Dashboard";
import AuthPage from "./scenes/Authentication/Authentication";
import { AuthProvider } from "./scenes/Authentication/AuthContext";
import PrivateRoute from "./utility/privateRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route 
            path="/home" 
            element={
              <PrivateRoute>
                <PatSelect />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
