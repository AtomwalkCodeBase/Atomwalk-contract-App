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
import NotFound from "./pages/NotFound";
import ActivityListScreen from "./pages/ActivityListScreen";
import ActivityListScreen1 from "./pages/New/ActivityListScreen";
import ProfitabilityDashboard from "./pages/ProfitabilityDashboard";
// import ResourceAllocationList from "./components/modal/ResourceAllocationList";
// import ResourceAllocation from "./components/modal/ResourceAllocation";
import ResourceAllocation from "./components/modal/ModifiedAssignedResourceModal";
// import ClamList from "./pages/ClamList";
import ClamDetailsScreen from "./pages/ClamDetailsScreen";
import ClamList1 from "./pages/ClaimList1";
import ClamList from "./pages/New/ClaimList1";
import { ActivityProvider } from "./context/ActivityClaimContext";
// import AllocationPlanScreen from "./components/NEWMODAL/AllocationPlanScreen";

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
          <ActivityProvider>
            <Router basename="/retainer">
            {/* <Router> */}
              <Routes>
                {/* Public Routes */}
                {/* <Route path="/" element={<Hello />} /> */}
                <Route path="/login" element={<Logins />} />

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
                  <Route path="/activity" element={<ActivityListScreen />} />
                  {/* <Route path="/activity1" element={<ActivityListScreen1 />} /> */}
                  <Route path="/profitability-dashboard" element={<ProfitabilityDashboard />} />
                  {/* <Route path="/clam-list" element={<ClamList />} /> */}
                  <Route path="/clam-list" element={<ClamList1 />} />
                  {/* <Route path="/clam-list1" element={<ClamList />} /> */}
                  <Route path="/clamDetails" element={<ClamDetailsScreen />} />
                  {/* <Route path="/resource-list" element={<ResourceAllocationList />} /> */}
                  {/* <Route path="/resource-list" element={<ResourceAllocation />} /> */}
                  <Route path="/resource-list" element={<ResourceAllocation />} />
                  {/* <Route path="/allocation-screen" element={<AllocationPlanScreen />} /> */}
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Catch All */}
                {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
                <Route path="*" element={<NotFound />} />
              </Routes>
  
            </Router>
            <ToastContainer position="top-right" autoClose={3000} />
            </ActivityProvider>
        </ThemeProvider>
      </AuthProvider>
  );

}

export default App;
