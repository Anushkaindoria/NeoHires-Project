
// ================= HACKATHON DATA =================
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


// const hackathonData = [
//   {
//     company: "Uber",
//     name: "HackTag",
//     theme: "Software Engineering",
//     techStack: [
//     "C++ / Java / Python",
//     "Graphs, DP, Advanced Algorithms",
//   ],
//     status: "Open",
//     logo: "assets/logos/uber.png",
//     applyLink: "https://www.uber.com/"
//   },
//   {
//     company: "Meta",
//     name: "Meta Hacker Cup",
//     theme: "Competitive Programming",
//     techStack: [
//     "C++ / Java / Python",
//     "Graphs, DP, Advanced Algorithms"
    
//   ],
//     status: "Open",
//     logo: "assets/logos/meta.png",
//     applyLink: "https://www.facebook.com/codingcompetitions"
//   },
//   {
//     company: "Amazon",
//     name: "Amazon ML Challenge",
//     theme: "Machine Learning",
//     techStack: [
//     "Python, Pandas, Scikit-learn",
//     "XGBoost, TensorFlow"
//   ],
//     status: "Upcoming",
//     logo: "assets/logos/amazon.png",
//     applyLink: "https://www.hackerearth.com"
//   },
//   {
//     company: "Nvidia",
//     name: "NVIDIA AI Hackathon",
//     theme: "Deep Learning",
//     techStack: [
//     "PyTorch, CUDA",
//     "GPUs, RAPIDS"
//   ],
//     status: "Upcoming",
//     logo: "assets/logos/nvidia.png",
//     applyLink: "https://www.nvidia.com"
//   },
//   {
//     company: "Apple",
//     name: "Apple Swift Student Challenge",
//     theme: "App Development",
//     techStack: [
//     "Swift, SwiftUI",
//     "iOS frameworks"
//   ],
//     status: "Upcoming",
//     logo: "assets/logos/apple.png",
//     applyLink: "https://developer.apple.com/swift-student-challenge"
//   },
//   {
//     company: "OpenAI",
//     name: "OpenAI Hackathon",
//     theme: "Generative AI",
//     techStack: [
//     "OpenAI API",
//     "Python / Node.js"
//   ],
//     status: "Upcoming",
//     logo: "assets/logos/OpenAI.png",
//     applyLink: "https://openai.com"
//   },
//   {
//     company: "IBM",
//     name: "IBM Call for Code",
//     theme: "Climate & Social Good",
//     techStack: [
//     "IBM Cloud",
//     "AI, IoT, Blockchain"
//   ],
//     status: "Upcoming",
//     logo: "assets/logos/ibm.png",
//     applyLink: "https://www.ibm.com/call-for-code"
//   },
//   {
//     company: "ETH Global",
//     name: "ETHGlobal Hackathons",
//     theme: "Climate & Social Good",
//     techStack: [
//     "Solidity",
//     "React + Ethers.js"
//    ],
//     status: "Upcoming",
//     logo: "assets/logos/ETHglobal.jpg",
//     applyLink: "https://ethglobal.com"
//   },
//   {
//     company: "Solana",
//     name: "Solana Global Hackathon",
//     theme: "Blockchain",
//     techStack: [
//     "Rust",
//     "Solana SDK"
//    ],
//     status: "Upcoming",
//     logo: "assets/logos/solana.png",
//     applyLink: "https://solana.com/hackathons"
//   },
//   {
//     company: "Polkadot",
//     name: "Polkadot Decode Hackathon",
//     theme: "Web3 Infra",
//     techStack: [
//     "Rust",
//     "Substrate"
//    ],
//     status: "Upcoming",
//     logo: "assets/logos/polkadot.png",
//     applyLink: "https://polkadot.network"
//   }
// ];


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

// // Filter hackathons month-wise
// function filterHackathons(selectedMonth) {
//   const container = document.getElementById("hackathon-container");
//   container.innerHTML = "";

//   const filtered = data.filter(
//     item =>
//       item.month.toLowerCase() === selectedMonth.toLowerCase() &&
//       item.type.toLowerCase() === "hackathon"
//   );

//   if (filtered.length === 0) {
//     container.innerHTML = `<p style="text-align:center;color:#6b7280;">
//       No hackathons this month
//     </p>`;
//     return;
//   }

//   filtered.forEach(item => {
//     const card = document.createElement("div");
//     card.className = "card";

//     const normalizedStatus = item.status.toLowerCase();
//     let statusClass = "status-upcoming";

// if (normalizedStatus === "open") {
//   statusClass = "status-open";
// } else if (normalizedStatus === "closed") {
//   statusClass = "status-closed";
// } else if (normalizedStatus === "closing-soon") {
//   statusClass = "status-closing-soon";
// }


//     card.innerHTML = `
//       <div class="card-header">
//         <img src="${item.logo}" class="company-logo" />
//         <h3 class="company-name">${item.name}</h3>
//       </div>
//       <p><i class="fa-solid fa-code"></i> <strong>Name:</strong> ${item.name}</p>
//       <p class="hackathon-tag">${item.company}</p>
//       <hr>
//       <p><i class="fa-solid fa-code"></i> <strong>Theme:</strong> ${item.role}</p>
//       <hr>
//       <p><i class="fa-solid fa-users"></i> <strong>Eligibility:</strong> ${item.eligibility}</p>
//       <hr>

//       <p class="${statusClass}">● ${item.status}</p>

//       <a href="${item.applyLink}" target="_blank">
//         <button class="apply-btn">Apply Now</button>
//       </a>
//     `;

//     container.appendChild(card);
//   });
// }

// Override month click behavior WITHOUT changing existing logic
// document.querySelectorAll(".month-btn").forEach(btn => {
//   btn.addEventListener("click", () => {
//     const month = btn.innerText;
//     if (currentMode === "hackathon") {
//       filterHackathons(month);
//     }
//   });
// });
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


// ================= HACKATHON ADD END =================
