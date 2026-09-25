const API_BASE = "http://localhost:5000/api";

export async function fetchInternships() {
  const res = await fetch(`${API_BASE}/internships`);
  return res.json();
}

export async function fetchHackathons() {
  const res = await fetch(`${API_BASE}/hackathons`);
  return res.json();
}

export async function signup(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signup failed");
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
}

export async function fetchDashboard(token) {
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load dashboard");
  return data;
}



export async function saveListing(token, listingType, listingId) {
  const res = await fetch(`${API_BASE}/saved`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ listingType, listingId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save listing");
  return data;
}

export async function setApplicationStatus(token, listingType, listingId, status) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ listingType, listingId, status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update status");
  return data;
}