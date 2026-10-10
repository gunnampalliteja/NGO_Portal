const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export async function getCampaigns({
  category = "",
  search = "",
  featured = "",
  status = "active",
} = {}) {
  const params = new URLSearchParams();

  if (category && category !== "All") {
    params.set("category", category);
  }

  if (search) {
    params.set("search", search);
  }

  if (featured) {
    params.set("featured", "true");
  }

  if (status) {
    params.set("status", status);
  }

  const query = params.toString();

  const response = await fetch(
    `${API_URL}/campaigns${query ? `?${query}` : ""}`
  );

  if (!response.ok) {
    throw new Error("Failed to load campaigns");
  }

  return response.json();
}

export async function getCampaign(slug) {
  const response = await fetch(
    `${API_URL}/campaigns/${slug}`
  );

  if (!response.ok) {
    throw new Error("Campaign not found");
  }

  return response.json();
}