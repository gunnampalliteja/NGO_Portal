import { BrowserRouter, Routes, Route } from "react-router-dom";
import Campaigns from "./pages/Campaigns.jsx";
import CampaignDetails from "./pages/campaigndetails.jsx";
import PremiumHome from "./components/PremiumHome";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id" element={<CampaignDetails />} />
        <Route path="/" element={<PremiumHome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;