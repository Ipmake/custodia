import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getBaseURL } from "./functions";

// Pages
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      location.pathname = "/login";
    }
    axios
      .get(`${getBaseURL()}/verifyToken`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (!res.data.authenticated) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
