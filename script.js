
let internships = [];
let hackathons = [];

const API_BASE = (() => {
  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  return isLocalHost ? "http://localhost:5000" : "https://neohires-project-1.onrender.com";
})();

const AUTH_KEY = "neohires_token";
const state = {
  authMode: "login",
  token: localStorage.getItem(AUTH_KEY) || "",
  user: null,
  dashboard: null
};

function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }
  return headers;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = data && typeof data === "object" ? data.message : "Request failed";
    throw new Error(message || "Request failed");
  }

  return data;
}

async function fetchInternships() {
  try {
    const res = await fetch(`${API_BASE}/api/internships`);
    if (!res.ok) throw new Error(`Internships request failed: ${res.status}`);
    internships = await res.json();
  } catch (err) {
    console.error("Failed to fetch internships", err);
    internships = [];
    const container = document.getElementById("cards-container");
    if (container) {
      container.innerHTML = "<p class='error-msg'>Couldn't load internships. Please try again later.</p>";
    }
  }
}

async function fetchHackathons() {
  try {
    const res = await fetch(`${API_BASE}/api/hackathons`);
    if (!res.ok) throw new Error(`Hackathons request failed: ${res.status}`);
    hackathons = await res.json();
  } catch (err) {
    console.error("Failed to fetch hackathons", err);
    hackathons = [];
    const container = document.getElementById("hackathon-container");
    if (container) {
      container.innerHTML = "<p class='error-msg'>Couldn't load hackathons. Please try again later.</p>";
    }
  }
}

function showMessage(message, type = "info") {
  const box = document.getElementById("auth-message");
  if (!box) return;
  box.textContent = message;
  box.className = `auth-message ${type}`;
}

function syncAuthUI() {
  const authSection = document.getElementById("auth-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const userBadge = document.getElementById("user-badge");
  const logoutBtn = document.getElementById("logout-btn");
  const nameField = document.getElementById("name-field");
  const authSubmit = document.getElementById("auth-submit");

  if (state.token && state.user) {
    authSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    userBadge.textContent = `Hi, ${state.user.name}`;
    logoutBtn.classList.remove("hidden");
    authSubmit.textContent = "Login";
    nameField.classList.add("hidden");
  } else {
    authSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
    userBadge.textContent = "Not signed in";
    logoutBtn.classList.add("hidden");
    authSubmit.textContent = state.authMode === "signup" ? "Sign Up" : "Login";
    nameField.classList.toggle("hidden", state.authMode !== "signup");
  }
}

function setAuthMode(mode) {
  state.authMode = mode;
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.authMode === mode));
  const submitText = mode === "signup" ? "Sign Up" : "Login";
  const submit = document.getElementById("auth-submit");
  if (submit) submit.textContent = submitText;
  const nameField = document.getElementById("name-field");
  if (nameField) nameField.classList.toggle("hidden", mode !== "signup");
}

async function loadDashboard() {
  if (!state.token) {
    state.dashboard = null;
    renderDashboard();
    return;
  }

  try {
    const data = await apiRequest("/api/dashboard");
    state.dashboard = data;
    renderDashboard();
  } catch (error) {
    console.error("Dashboard failed", error);
    showMessage(error.message, "error");
    localStorage.removeItem(AUTH_KEY);
    state.token = "";
    state.user = null;
    state.dashboard = null;
    syncAuthUI();
  }
}

function renderDashboard() {
  const summary = state.dashboard?.summary || {
    savedCount: 0,
    appliedCount: 0,
    interviewingCount: 0,
    rejectedCount: 0,
    offerCount: 0
  };

  document.getElementById("summary-saved").textContent = summary.savedCount;
  document.getElementById("summary-applied").textContent = summary.appliedCount;
  document.getElementById("summary-interviewing").textContent = summary.interviewingCount;
  document.getElementById("summary-rejected").textContent = summary.rejectedCount;
  document.getElementById("summary-offer").textContent = summary.offerCount;

  const savedList = document.getElementById("saved-list");
  const appsList = document.getElementById("applications-list");

  if (!state.dashboard || !state.dashboard.savedListings?.length) {
    savedList.innerHTML = '<div class="empty-state">No saved listings yet.</div>';
  } else {
    savedList.innerHTML = state.dashboard.savedListings.map((item) => {
      const listing = item.listing || {};
      const company = listing.company || "Opportunity";
      const name = listing.name || listing.theme || "Listing";
      return `
        <div class="dashboard-item">
          <div>
            <strong>${company}</strong>
            <p>${name}</p>
            <small>${item.listingType}</small>
          </div>
          <button class="danger-btn" data-delete-saved="${item._id}">Remove</button>
        </div>
      `;
    }).join("");
  }

  if (!state.dashboard || !state.dashboard.applications?.length) {
    appsList.innerHTML = '<div class="empty-state">No applications tracked yet.</div>';
  } else {
    appsList.innerHTML = state.dashboard.applications.map((item) => {
      const listing = item.listing || {};
      const company = listing.company || "Opportunity";
      const name = listing.name || listing.theme || "Listing";
      const selectOptions = ["Applied", "Interviewing", "Rejected", "Offer"]
        .map((value) => `<option value="${value}" ${item.status === value ? "selected" : ""}>${value}</option>`)
        .join("");

      return `
        <div class="dashboard-item dashboard-item-column">
          <div>
            <strong>${company}</strong>
            <p>${name}</p>
            <small>${item.listingType}</small>
          </div>
          <div class="status-row">
            <select class="status-select" data-application-status="${item._id}">
              ${selectOptions}
            </select>
            <button class="danger-btn" data-delete-application="${item._id}">Delete</button>
          </div>
        </div>
      `;
    }).join("");
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById("name-input");
  const emailInput = document.getElementById("email-input");
  const passwordInput = document.getElementById("password-input");

  const payload = {
    email: emailInput.value.trim(),
    password: passwordInput.value.trim()
  };

  if (state.authMode === "signup") {
    payload.name = nameInput.value.trim();
  }

  try {
    const endpoint = state.authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const result = await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    state.token = result.token;
    state.user = result.user;
    localStorage.setItem(AUTH_KEY, state.token);
    showMessage(state.authMode === "signup" ? "Account created successfully." : "Logged in successfully.", "success");
    emailInput.value = "";
    passwordInput.value = "";
    nameInput.value = "";
    await loadDashboard();
    syncAuthUI();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function handleLogout() {
  localStorage.removeItem(AUTH_KEY);
  state.token = "";
  state.user = null;
  state.dashboard = null;
  showMessage("You have been logged out.", "success");
  syncAuthUI();
}

async function handleSaveListing(listingType, listingId) {
  if (!state.token) {
    showMessage("Please log in to save this listing.", "error");
    return;
  }

  try {
    await apiRequest("/api/saved", {
      method: "POST",
      body: JSON.stringify({ listingType, listingId })
    });
    showMessage("Listing saved successfully.", "success");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function handleDeleteSaved(id) {
  try {
    await apiRequest(`/api/saved/${id}`, { method: "DELETE" });
    showMessage("Saved listing removed.", "success");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function handleDeleteApplication(id) {
  try {
    await apiRequest(`/api/applications/${id}`, { method: "DELETE" });
    showMessage("Application deleted.", "success");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function handleApplicationStatusUpdate(id, status) {
  try {
    await apiRequest(`/api/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    showMessage("Application status updated.", "success");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function filterMonth(selectedMonth) {
  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  const filtered = internships.filter(
    (item) => item.month.toLowerCase() === selectedMonth.toLowerCase()
  );

  filtered.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    const normalizedStatus = item.status.toLowerCase();
    const isClosed = normalizedStatus === "closed";
    let statusClass = "status-upcoming";

    if (normalizedStatus === "open") {
      statusClass = "status-open";
    } else if (normalizedStatus === "closed") {
      statusClass = "status-closed";
    } else if (normalizedStatus === "closing-soon") {
      statusClass = "status-closing-soon";
    }

    card.innerHTML = `
      <div class="card-header">
        <img src="${item.logo}" alt="${item.company} logo" class="company-logo" onerror="this.src='assets/logos/default.png'" />
        <h3 class="company-name">${item.company}</h3>
      </div>

      <p><i class="fa-solid fa-code"></i> <strong>Name:</strong> ${item.name}</p>
      <hr>
      <p><i class="fa-solid fa-laptop"></i> <strong>Role:</strong> ${item.role}</p>
      <hr>
      <p><i class="fa-solid fa-briefcase"></i> <strong>Type:</strong> ${item.type}</p>
      <hr>
      <p><i class="fa-solid fa-graduation-cap"></i> <strong>Eligibility:</strong> ${item.eligibility}</p>
      <hr>

      <p class="${statusClass}">● ${item.status}</p>

      <a href="${isClosed ? '#' : item.applyLink}" target="_blank">
        <button class="apply-btn ${isClosed ? "disabled" : ""}" ${isClosed ? "disabled" : ""}>
          Apply Now
        </button>
      </a>
      <button class="save-btn" data-save-listing="${item._id}" data-listing-type="internship">
        Save
      </button>
    `;

    container.appendChild(card);
  });
}

function selectMonth(button, month) {
  document.querySelectorAll(".month-btn").forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");
  filterMonth(month);
}

let currentMode = "internship";

function showInternships() {
  currentMode = "internship";
  document.getElementById("cards-container").style.display = "flex";
  document.getElementById("hackathon-container").style.display = "none";
  document.getElementById("months").style.display = "flex";

  toggleActiveButton(0);
  const activeMonthBtn = document.querySelector(".month-btn.active");
  if (activeMonthBtn) {
    filterMonth(activeMonthBtn.innerText);
  }
}

function showHackathons() {
  currentMode = "hackathon";
  document.getElementById("cards-container").style.display = "none";
  document.getElementById("hackathon-container").style.display = "flex";
  document.getElementById("months").style.display = "none";
  toggleActiveButton(1);
  showAllHackathons();
}

function toggleActiveButton(index) {
  const buttons = document.querySelectorAll(".toggle-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));
  buttons[index].classList.add("active");
}

function showAllHackathons() {
  const container = document.getElementById("hackathon-container");
  container.innerHTML = "";

  hackathons.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    const normalizedStatus = item.status.toLowerCase();
    let statusClass = "status-upcoming";

    if (normalizedStatus === "open") {
      statusClass = "status-open";
    } else if (normalizedStatus === "closed") {
      statusClass = "status-closed";
    } else if (normalizedStatus === "closing-soon") {
      statusClass = "status-closing-soon";
    }

    card.innerHTML = `
      <div class="card-header">
        <img src="${item.logo}" class="company-logo" onerror="this.src='assets/logos/default.png'" />
        <h3 class="company-name">${item.company}</h3>
      </div>

      <p class="hackathon-tag">${item.name}</p>
      <hr>
      <p><strong>Theme:</strong> ${item.theme}</p>
      <hr>
      <p><strong>Tech Stack:</strong></p>
      <ul class="tech-stack">
        ${item.techStack.map((skill) => `<li>${skill}</li>`).join("")}
      </ul>
      <hr>
      <p class="${statusClass}">● ${item.status}</p>

      <a href="${item.applyLink}" target="_blank">
        <button class="apply-btn">Apply Now</button>
      </a>
      <button class="save-btn" data-save-listing="${item._id}" data-listing-type="hackathon">Save</button>
    `;

    container.appendChild(card);
  });
}

function bindGlobalEvents() {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
  });

  document.getElementById("auth-form").addEventListener("submit", handleAuthSubmit);
  document.getElementById("logout-btn").addEventListener("click", handleLogout);

  document.addEventListener("click", async (event) => {
    const saveButton = event.target.closest("[data-save-listing]");
    if (saveButton) {
      const listingId = saveButton.dataset.saveListing;
      const listingType = saveButton.dataset.listingType;
      await handleSaveListing(listingType, listingId);
      return;
    }

    const deleteSaved = event.target.closest("[data-delete-saved]");
    if (deleteSaved) {
      await handleDeleteSaved(deleteSaved.dataset.deleteSaved);
      return;
    }

    const deleteApp = event.target.closest("[data-delete-application]");
    if (deleteApp) {
      await handleDeleteApplication(deleteApp.dataset.deleteApplication);
    }
  });

  document.addEventListener("change", async (event) => {
    const target = event.target.closest("[data-application-status]");
    if (target) {
      await handleApplicationStatusUpdate(target.dataset.applicationStatus, target.value);
    }
  });

  const januaryBtn = document.querySelector(".month-btn[onclick*='January']");
  if (januaryBtn) {
    januaryBtn.classList.add("active");
  }
}

window.onload = async function () {
  bindGlobalEvents();
  setAuthMode("login");
  syncAuthUI();

  await Promise.all([fetchInternships(), fetchHackathons()]);

  const januaryBtn = document.querySelector(".month-btn[onclick*='January']");
  if (januaryBtn) {
    januaryBtn.classList.add("active");
  }

  filterMonth("January");

  if (state.token) {
    await loadDashboard();
  }
};

