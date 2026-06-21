// Search + category filter for /tools.html
(function () {
  const grid = document.querySelector("#tools-grid");
  const search = document.querySelector("#tool-search");
  const chips = document.querySelectorAll(".chip");
  const meta = document.querySelector("#result-meta");
  const empty = document.querySelector("#empty-state");
  if (!grid || !window.SITE) return;

  const { TOOLS, cardHTML } = window.SITE;
  grid.innerHTML = TOOLS.map(cardHTML).join("");

  let q = "";
  let cat = "All";

  function apply() {
    const cards = grid.querySelectorAll(".card");
    let visible = 0;
    cards.forEach((c) => {
      const matchCat = cat === "All" || c.dataset.category === cat;
      const text = c.dataset.name + " " + c.dataset.desc + " " + c.dataset.category.toLowerCase();
      const matchQ = !q || text.includes(q);
      const show = matchCat && matchQ;
      c.style.display = show ? "" : "none";
      if (show) visible++;
    });
    meta.textContent = `${visible} of ${TOOLS.length} tools`;
    empty.style.display = visible === 0 ? "" : "none";
  }

  search.addEventListener("input", (e) => {
    q = e.target.value.trim().toLowerCase();
    apply();
  });
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      cat = chip.dataset.cat;
      apply();
    });
  });
  apply();
})();
