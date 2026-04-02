const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const billingButtons = document.querySelectorAll(".toggle-btn");
const prices = document.querySelectorAll(".price");
const billingLabels = document.querySelectorAll(".billing-cycle");
const revealItems = document.querySelectorAll(".reveal");
const parallaxTarget = document.querySelector("[data-parallax]");

const setBilling = (mode) => {
  billingButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.billing === mode);
  });

  prices.forEach((price) => {
    const amount = price.dataset[mode];
    price.textContent = `$${amount}`;
  });

  billingLabels.forEach((label) => {
    label.textContent = mode === "monthly" ? "/ month" : "/ year";
  });
};

const closeMenu = () => {
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

billingButtons.forEach((button) => {
  button.addEventListener("click", () => setBilling(button.dataset.billing));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealItems.forEach((item) => {
  if (!item.classList.contains("reveal-hero")) {
    revealObserver.observe(item);
  }
});

const handleScroll = () => {
  const scrollTop = window.scrollY;

  navbar.classList.toggle("is-scrolled", scrollTop > 24);

  if (parallaxTarget) {
    const offset = Math.min(scrollTop * 0.16, 48);
    const scale = 1.06 + Math.min(scrollTop * 0.00008, 0.03);
    parallaxTarget.style.transform = `translateY(${offset}px) scale(${scale})`;
  }
};

document.addEventListener("click", (event) => {
  if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
    closeMenu();
  }
});

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("load", () => {
  setBilling("monthly");
  handleScroll();
});
