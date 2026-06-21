// Mobile nav toggle + active-link highlight
(function () {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-mobile");
  if (toggle && menu) {
    toggle.addEventListener("click", () => menu.classList.toggle("open"));
  }
  const path = location.pathname.replace(/\/$/, "") || "/index.html";
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const href = a.getAttribute("href");
    const norm = href === "/" ? "/index.html" : href;
    if (path.endsWith(norm) || (norm === "/index.html" && (path === "" || path === "/"))) {
      a.classList.add("active");
    }
  });

  // Render featured tools on landing
  const featuredGrid = document.querySelector("#featured-grid");
  if (featuredGrid && window.SITE) {
    const featured = window.SITE.TOOLS.filter((t) => t.featured);
    featuredGrid.innerHTML = featured.map(window.SITE.cardHTML).join("");
  }
})();


// Auto bug count
const bugCards = document.querySelectorAll('.bug-card');
const bugCount = document.querySelector('.bug-count');
if (bugCount) bugCount.textContent = bugCards.length + ' report' + (bugCards.length !== 1 ? 's' : '');