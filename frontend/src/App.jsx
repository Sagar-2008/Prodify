import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";

import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Pomodoro from "./pages/dashboard/Pomodoro";
import Habits from "./pages/dashboard/Habits";
import Music from "./pages/dashboard/Music";
import Analytics from "./pages/dashboard/Analytics";
import Journal from "./pages/dashboard/Journal";
import QuestBoard from "./pages/dashboard/QuestBoard";
import Goals from "./pages/dashboard/Goals";
import Dojo from "./pages/dashboard/Dojo";
import Settings from "./pages/dashboard/Settings";

import ProtectedRoute from "./components/ProtectedRoute";
import { PomodoroProvider } from "./context/PomodoroContext";
import { MusicProvider } from "./context/MusicProvider";
import { ProductivityProvider } from "./context/ProductivityContext";

export default function App() {
  return (
    <PomodoroProvider>
      <MusicProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            <Route
              path="/dashboard"
              element={
                <ProductivityProvider>
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                </ProductivityProvider>
              }
            >
              <Route index element={<Overview />} />
              <Route path="quests" element={<QuestBoard />} />
              <Route path="goals" element={<Goals />} />
              <Route path="dojo" element={<Dojo />} />
              <Route path="settings" element={<Settings />} />
              <Route path="pomodoro" element={<Pomodoro />} />
              <Route path="habits" element={<Habits />} />
              <Route path="music" element={<Music />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="journal" element={<Journal />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MusicProvider>
    </PomodoroProvider>
  );
}
