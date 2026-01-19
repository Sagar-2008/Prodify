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
import Notes from "./pages/dashboard/Notes";
import Analytics from "./pages/dashboard/Analytics";

import ProtectedRoute from "./components/ProtectedRoute";
import { PomodoroProvider } from "./context/PomodoroContext";
import { MusicProvider } from "./context/MusicContext";

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
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="pomodoro" element={<Pomodoro />} />
              <Route path="habits" element={<Habits />} />
              <Route path="music" element={<Music />} />
              <Route path="notes" element={<Notes />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MusicProvider>
    </PomodoroProvider>
  );
}
