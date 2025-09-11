const API_BASE = "https://trustshield-backend.onrender.com/api";

/**
 * Fetch dashboard metrics
 */
export async function fetchDashboard() {
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) {
      throw new Error("Failed to fetch dashboard data");
    }
    return await res.json();
  } catch (err) {
    console.error("API error (dashboard):", err);
    return null;
  }
}

/**
 * Fetch alerts list
 */
export async function fetchAlerts() {
  try {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) {
      throw new Error("Failed to fetch alerts data");
    }
    return await res.json();
  } catch (err) {
    console.error("API error (alerts):", err);
    return null;
  }
}

/**
 * Respond to an alert
 * @param {string} alertId - The alert's ID
 * @param {"yes"|"no"|"need_help"} response - Analyst's response
 */
export async function respondToAlert(alertId, response) {
  try {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });

    if (!res.ok) {
      throw new Error(`Failed to respond to alert ${alertId}`);
    }

    return await res.json();
  } catch (err) {
    console.error("API error (respondToAlert):", err);
    throw err;
  }
}

/**
 * Unmask an alert (reveal employee identity)
 * @param {string} alertId - The alert's ID
 */
export async function unmaskAlert(alertId) {
  try {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/unmask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Failed to unmask alert ${alertId}`);
    }

    return await res.json();
  } catch (err) {
    console.error("API error (unmaskAlert):", err);
    throw err;
  }
}
