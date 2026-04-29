const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function addBus(bus) {
  return request("/add-bus", {
    method: "POST",
    body: JSON.stringify(bus)
  });
}

export function updateBus(id, bus) {
  return request(`/update-bus/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(bus)
  });
}

export function deleteBus(id) {
  return request(`/delete-bus/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

export { API_BASE_URL };
