// Prefer a Vite-provided env variable for the API base, fallback to local backend
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:5000/api";

/**
 * Subscribe to server-sent alerts stream. Callback will be called with the parsed payload { alerts }.
 * Returns an object with `close()` to unsubscribe.
 */
export function subscribeToAlerts(onMessage) {
  try {
    const es = new EventSource(`${API_BASE}/stream/alerts`);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        onMessage && onMessage(data);
      } catch (err) {
        console.error('Invalid SSE payload', err);
      }
    };
    es.onerror = (e) => {
      // leave error handling to consumer; close on network error
      console.error('SSE error', e);
    };
    return { close: () => es.close() };
  } catch (err) {
    console.warn('SSE not available', err);
    return { close: () => {} };
  }
}

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

export async function fetchEmployee(id) {
  try {
    const res = await fetch(`${API_BASE}/employees/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch employee');
    return await res.json();
  } catch (err) {
    console.error('API error (fetchEmployee):', err);
    return null;
  }
}

export async function fetchAlert(id) {
  try {
    const res = await fetch(`${API_BASE}/alerts/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch alert');
    return await res.json();
  } catch (err) {
    console.error('API error (fetchAlert):', err);
    return null;
  }
}
