import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import { GlobalStyles } from "./styles/GlobalStyles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Auth & Protected Routes
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";


import RetainerScreen from "./pages/ReainerScreen";
import Logins from "./pages/Login";
import Hello from "./pages/Hello";
import Profile from "./pages/Profile";


function App() {
  const url = "https://www.atomwalk.com/rest-auth/login/";
  const data = {
    username: "ASHUTOSH@PMA_00001",
    password: "ashutosh@11",
  };

  useEffect(() => {
    if (!localStorage.getItem("apiResponse")) {
      loginAndStore();
    }
  }, []);

  const loginAndStore = async () => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const responseData = await response.json();
      localStorage.setItem("apiResponse", JSON.stringify(responseData));
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
      <AuthProvider>
        <ThemeProvider>
            <Router basename="/retainer">
            {/* <Router> */}
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Hello />} />
                <Route path="/login.html" element={<Logins />} />

                {/* Protected Routes with GlobalStyles */}
                <Route
                  element={
                    <ProtectedRoute>
                      <>
                        <GlobalStyles />
                        <Outlet />
                      </>
                    </ProtectedRoute>
                  }
                >

                  <Route path="/dashboard" element={<RetainerScreen />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
  
            </Router>
            <ToastContainer position="top-right" autoClose={3000} />
        </ThemeProvider>
      </AuthProvider>
  );

}

export default App;
