import { useState, useEffect } from "react";
import "./style.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import AppHeader from "./components/AppHeader";
import AuthSection from "./components/AuthSection";
import Dashboard from "./components/Dashboard";
import ModeToggle from "./components/ModeToggle";
import MonthSelector from "./components/MonthSelector";
import InternshipCard from "./components/InternshipCard";
import HackathonCard from "./components/HackathonCard";
import { fetchInternships, fetchHackathons } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [mode, setMode] = useState("internships");
  const [internships, setInternships] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("January");

  useEffect(() => {
    const savedToken = localStorage.getItem("neohire_token");
    const savedUser = localStorage.getItem("neohire_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    fetchInternships().then(setInternships);
    fetchHackathons().then(setHackathons);
  }, []);

  const handleAuthSuccess = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("neohire_token", tokenData);
    localStorage.setItem("neohire_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("neohire_token");
    localStorage.removeItem("neohire_user");
  };

  const filterByMonth = (listings) =>
    listings.filter(
      (item) => item.month && item.month.toLowerCase() === selectedMonth.toLowerCase()
    );

  const listingsToShow = mode === "internships" ? filterByMonth(internships) : hackathons;

  return (
    <div>
      <Navbar />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <Features />

      <section className="app-section" id="app-section">
        <h2>Browse current opportunities</h2>
        <AppHeader user={user} onLogout={handleLogout} />

        <main className="page-shell">
          {user ? (
            <Dashboard token={token} />
          ) : (
            <AuthSection onAuthSuccess={handleAuthSuccess} />
          )}
        </main>

        <ModeToggle mode={mode} setMode={setMode} />

        {mode === "internships" && (
          <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
        )}

        <section id="cards-container">
          {listingsToShow.length === 0 ? (
            <p className="empty-state">No listings found.</p>
          ) : (
            listingsToShow.map((item) =>
              mode === "internships" ? (
                <InternshipCard key={item._id} internship={item} token={token} isLoggedIn={!!user} />
              ) : (
                <HackathonCard key={item._id} hackathon={item} token={token} isLoggedIn={!!user} />
              )
            )
          )}
        </section>
      </section>

      <footer className="footer">
        <p>NeoHire — built by students, for students.</p>
      </footer>
    </div>
  );
}

export default App;