import { useState, useEffect, useRef } from "react";

function AdvancedFilters({
  types,
  eligibilities,
  roles,
  selectedType,
  setSelectedType,
  selectedEligibility,
  setSelectedEligibility,
  selectedRole,
  setSelectedRole,
}) {
  // Tracks which filter button is currently open: null, "type", "eligibility", or "role"
  const [openFilter, setOpenFilter] = useState(null);
  const wrapperRef = useRef(null);

  // Close whichever panel is open if the user clicks anywhere outside this filter bar
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleFilter(name) {
    setOpenFilter((current) => (current === name ? null : name));
  }

  function renderOptions(options, selectedValue, setSelectedValue) {
    return (
      <div className="filter-dropdown-panel">
        <button
          className={`filter-option ${selectedValue === "All" ? "filter-option-active" : ""}`}
          onClick={() => {
            setSelectedValue("All");
            setOpenFilter(null);
          }}
        >
          All
        </button>
        {options.map((option) => (
          <button
            key={option}
            className={`filter-option ${selectedValue === option ? "filter-option-active" : ""}`}
            onClick={() => {
              setSelectedValue(option);
              setOpenFilter(null);
            }}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  return (
    <section className="filters-toolbar" ref={wrapperRef}>
      <span className="filters-label">
        <svg className="filters-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 5H20L14 12.5V19L10 17V12.5L4 5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        Filters:
      </span>

      <div className="filter-item">
        <button
          className={`filter-button ${selectedType !== "All" ? "filter-button-active" : ""}`}
          onClick={() => toggleFilter("type")}
        >
          Type{selectedType !== "All" ? `: ${selectedType}` : ""}
          <svg
            className={`filter-caret ${openFilter === "type" ? "filter-caret-open" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {openFilter === "type" && renderOptions(types, selectedType, setSelectedType)}
      </div>

      <div className="filter-item">
        <button
          className={`filter-button ${selectedEligibility !== "All" ? "filter-button-active" : ""}`}
          onClick={() => toggleFilter("eligibility")}
        >
          Eligibility{selectedEligibility !== "All" ? `: ${selectedEligibility}` : ""}
          <svg
            className={`filter-caret ${openFilter === "eligibility" ? "filter-caret-open" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {openFilter === "eligibility" && renderOptions(eligibilities, selectedEligibility, setSelectedEligibility)}
      </div>

      <div className="filter-item">
        <button
          className={`filter-button ${selectedRole !== "All" ? "filter-button-active" : ""}`}
          onClick={() => toggleFilter("role")}
        >
          Role{selectedRole !== "All" ? `: ${selectedRole}` : ""}
          <svg
            className={`filter-caret ${openFilter === "role" ? "filter-caret-open" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {openFilter === "role" && renderOptions(roles, selectedRole, setSelectedRole)}
      </div>
    </section>
  );
}

export default AdvancedFilters;