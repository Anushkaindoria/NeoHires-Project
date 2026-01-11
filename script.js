
let internships = [];

async function fetchInternships() {
  try {
    const res = await fetch("https://neohires-project.onrender.com/api/internships");
    internships = await res.json();
  } catch (err) {
    console.error("Failed to fetch internships", err);
  }
}

let hackathons = [];

async function fetchHackathons() {
  try {
    const res = await fetch("https://neohires-project.onrender.com/api/hackathons");
    hackathons = await res.json();
  } catch (err) {
    console.error("Failed to fetch hackathons", err);
  }
}




function filterMonth(selectedMonth) {
  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  const filtered = internships.filter(
  item => item.month.toLowerCase() === selectedMonth.toLowerCase()
);


  filtered.forEach(item => {
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


    // ✅ MOVE JS LOGIC OUTSIDE TEMPLATE
    const isClosed = normalizedStatus === "closed";

    card.innerHTML = `
      <div class="card-header">
        <img 
          src="${item.logo}" 
          alt="${item.company} logo"
          class="company-logo"
          onerror="this.src='assets/logos/default.png'"
        />
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
    `;

    container.appendChild(card);
  });
}

function selectMonth(button, month) {
  // Remove active from all month buttons
  document.querySelectorAll(".month-btn").forEach(btn =>
    btn.classList.remove("active")
  );

  // Add active to clicked button
  button.classList.add("active");

  // Load cards for selected month
  filterMonth(month);
}
window.onload = async function () {
  await fetchInternships();
  await fetchHackathons();

  const januaryBtn = document.querySelector(".month-btn[onclick*='January']");
  januaryBtn.classList.add("active");
  filterMonth("January");
};

// ================= HACKATHON ADD START =================

// Track current mode
let currentMode = "internship"; // internship | hackathon

function showInternships() {
  currentMode = "internship";

  document.getElementById("cards-container").style.display = "flex";
  document.getElementById("hackathon-container").style.display = "none";

  // 🟢 SHOW MONTH BUTTONS AGAIN
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

  // 🔴 HIDE MONTH BUTTONS
  document.getElementById("months").style.display = "none";

  toggleActiveButton(1);

  // Show ALL hackathons (no month filter)
  showAllHackathons();
}


// Toggle active state
function toggleActiveButton(index) {
  const buttons = document.querySelectorAll(".toggle-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  buttons[index].classList.add("active");
}


function showAllHackathons() {
  const container = document.getElementById("hackathon-container");
  container.innerHTML = "";

  hackathons.forEach(item => {
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
        <img src="${item.logo}" class="company-logo" />
        <h3 class="company-name">${item.company}</h3>
      </div>

      <p class="hackathon-tag">${item.name}</p>
      <hr>

      <p><strong>Theme:</strong> ${item.theme}</p>
      <hr>

      <p><strong>Tech Stack:</strong></p>
      <ul class="tech-stack">
        ${item.techStack.map(skill => `<li>${skill}</li>`).join("")}
      </ul>
      <hr>

      <p class="${statusClass}">● ${item.status}</p>

      <a href="${item.applyLink}" target="_blank">
        <button class="apply-btn">Apply Now</button>
      </a>
    `;

    container.appendChild(card);
  });
}



