document.addEventListener("DOMContentLoaded", () => {
    const raw = sessionStorage.getItem("shenaiResults");
    const output = document.getElementById("output");
  
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        output.textContent = JSON.stringify(parsed, null, 2);
      } catch (e) {
        output.textContent = "Failed to parse results.";
        console.error("JSON parse error:", e);
      }
    } else {
      output.textContent = "No results available.";
    }
});
  