const backdrop = document.querySelector<HTMLElement>(".backdrop");
const sideDrawer = document.querySelector<HTMLElement>(".mobile-nav");
const menuToggle = document.querySelector<HTMLElement>("#side-menu-toggle");

function backdropClickHandler() {
  if (!backdrop || !sideDrawer) return;
  backdrop.style.display = "none";
  sideDrawer.classList.remove("open");
}

function menuToggleClickHandler() {
  if (!backdrop || !sideDrawer) return;
  backdrop.style.display = "block";
  sideDrawer.classList.add("open");
}

menuToggle?.addEventListener("click", menuToggleClickHandler);
backdrop?.addEventListener("click", backdropClickHandler);
