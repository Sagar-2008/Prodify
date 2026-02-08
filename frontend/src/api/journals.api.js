const API_URL = "/journal";

export const getJournalEntries = async () => {
  const response = await fetch(`${API_URL}/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!response.ok) throw new Error("Failed to fetch journal entries");
  return response.json();
};

export const getJournalByMonth = async (year, month) => {
  const response = await fetch(
    `${API_URL}/month?year=${year}&month=${month}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch month entries");
  return response.json();
};

export const getJournalEntry = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!response.ok) throw new Error("Failed to fetch journal entry");
  return response.json();
};

export const saveJournalEntry = async (entryData) => {
  const response = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(entryData),
  });
  if (!response.ok) {
    // try to parse error body for better message
    let msg = "Failed to save journal entry";
    try {
      const body = await response.json();
      if (body?.message) msg = body.message;
      else if (body?.error) msg = body.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(msg);
  }
  return response.json();
};

export const deleteJournalEntry = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!response.ok) throw new Error("Failed to delete journal entry");
  return response.json();
};

export const getJournalStats = async () => {
  const response = await fetch(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
};
