import { useState, useEffect } from "react";
import "./style.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import ModeToggle from "./components/ModeToggle";
import MonthSelector from "./components/MonthSelector";
import AdvancedFilters from "./components/AdvancedFilters";
import SortSelector from "./components/SortSelector";
import Pagination from "./components/Pagination";
import InternshipCard from "./components/InternshipCard";
import HackathonCard from "./components/HackathonCard";
import { fetchInternships, fetchHackathons } from "./services/api";

const MONTH_ORDER = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ITEMS_PER_PAGE = 6;

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [mode, setMode] = useState("internships");
  const [internships, setInternships] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedType, setSelectedType] = useState("All");
  const [selectedEligibility, setSelectedEligibility] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");

  const [sortBy, setSortBy] = useState("none");

  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [mode, selectedMonth, searchQuery, selectedType, selectedEligibility, selectedRole, sortBy]);

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

  function filterBySearch(items) {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();

    return items.filter((item) => {
      const company = (item.company || "").toLowerCase();
      const role = (item.role || "").toLowerCase();
      const name = (item.name || "").toLowerCase();
      const theme = (item.theme || "").toLowerCase();

      return (
        company.includes(query) ||
        role.includes(query) ||
        name.includes(query) ||
        theme.includes(query)
      );
    });
  }

  function filterByAdvanced(items) {
    return items.filter((item) => {
      const matchesType = selectedType === "All" || item.type === selectedType;
      const matchesEligibility =
        selectedEligibility === "All" || item.eligibility === selectedEligibility;
      const matchesRole = selectedRole === "All" || item.role === selectedRole;

      return matchesType && matchesEligibility && matchesRole;
    });
  }

  function sortListings(items) {
    if (sortBy === "none") return items;

    const sorted = [...items];

    if (sortBy === "company-asc") {
      sorted.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
    } else if (sortBy === "company-desc") {
      sorted.sort((a, b) => (b.company || "").localeCompare(a.company || ""));
    } else if (sortBy === "month-order") {
      sorted.sort((a, b) => {
        const indexA = MONTH_ORDER.indexOf(a.month);
        const indexB = MONTH_ORDER.indexOf(b.month);
        return indexA - indexB;
      });
    }

    return sorted;
  }

  const uniqueTypes = [...new Set(internships.map((item) => item.type).filter(Boolean))];
  const uniqueEligibilities = [
    ...new Set(internships.map((item) => item.eligibility).filter(Boolean)),
  ];
  const uniqueRoles = [...new Set(internships.map((item) => item.role).filter(Boolean))];

  const allFilteredListings =
    mode === "internships"
      ? sortListings(filterBySearch(filterByAdvanced(filterByMonth(internships))))
      : sortListings(filterBySearch(hackathons));

  const totalPages = Math.ceil(allFilteredListings.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const listingsToShow = allFilteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div>
      <Navbar
        user={user}
        onGetStartedClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      {!user && (
        <>
          <Hero />
          <TrustBar />
          <HowItWorks />
          <Features />
        </>
      )}

      <section className="app-section" id="app-section">
        {user && (
          <div className="dashboard-area">
            <div className="dashboard-welcome">
              <h2>Welcome back, {user.name}</h2>
              <p>Here's a quick look at your saved listings and applications.</p>
            </div>
            <Dashboard token={token} />
          </div>
        )}

        <div className="browse-banner">
          <h2>Browse current opportunities</h2>
          <p>Fresh internships and hackathons, updated automatically.</p>
        </div>

        <ModeToggle mode={mode} setMode={setMode} />

        {mode === "internships" && (
          <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
        )}

        <div className="search-bar-wrapper">
          <svg className="search-bar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by company, role, or theme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar-input"
          />
        </div>

        <div className="toolbar-row">
          {mode === "internships" && (
            <AdvancedFilters
              types={uniqueTypes}
              eligibilities={uniqueEligibilities}
              roles={uniqueRoles}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedEligibility={selectedEligibility}
              setSelectedEligibility={setSelectedEligibility}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
            />
          )}

          <SortSelector
            sortBy={sortBy}
            setSortBy={setSortBy}
            showMonthOption={mode === "internships"}
          />
        </div>

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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </section>

      <footer className="footer">
        <p>NeoHire — built by students, for students.</p>
      </footer>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

export default App;