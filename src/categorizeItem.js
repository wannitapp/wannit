export async function categorizeItem(name, price) {
  try {
    const res = await fetch("/api/categorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    });
    const data = await res.json();
    return data.category ?? "Otro";
  } catch (e) {
    console.warn("Categorización falló:", e);
    return "Otro";
  }
}