const API_BASE = "/api";
const CURRENCY_SYMBOL = "\u20b9";

const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const billingButtons = document.querySelectorAll(".toggle-btn");
const pricingGrid = document.querySelector(".pricing-grid");
const priceCards = document.querySelectorAll(".price-card");
const prices = document.querySelectorAll(".price");
const billingLabels = document.querySelectorAll(".billing-cycle");
const choosePlanButtons = document.querySelectorAll(".choose-plan-btn");
const membershipForm = document.querySelector("#membership-form");
const contactForm = document.querySelector("#contact-form");
const membershipStatus = document.querySelector("#membership-status");
const contactStatus = document.querySelector("#contact-status");
const membershipPlanSelect = document.querySelector("#membership-plan");
const membershipBillingSelect = document.querySelector("#membership-billing");
const membershipAmountInput = document.querySelector("#membership-amount");
const trainerTrack = document.querySelector("#trainer-track");
const classGrid = document.querySelector("#class-grid");
const adminLoginForm = document.querySelector("#admin-login-form");
const adminAuthStatus = document.querySelector("#admin-auth-status");
const adminDashboard = document.querySelector("#admin-dashboard");
const adminLogoutButton = document.querySelector("#admin-logout-btn");
const trainerForm = document.querySelector("#trainer-form");
const classForm = document.querySelector("#class-form");
const trainerFormStatus = document.querySelector("#trainer-form-status");
const classFormStatus = document.querySelector("#class-form-status");
const trainerFormReset = document.querySelector("#trainer-form-reset");
const classFormReset = document.querySelector("#class-form-reset");
const adminStats = document.querySelector("#admin-stats");
const adminMembershipsBody = document.querySelector("#admin-memberships-body");
const adminContactsList = document.querySelector("#admin-contacts-list");
const adminPaymentsBody = document.querySelector("#admin-payments-body");
const adminTrainersList = document.querySelector("#admin-trainers-list");
const adminClassesList = document.querySelector("#admin-classes-list");
const revealItems = document.querySelectorAll(".reveal");
const parallaxTarget = document.querySelector("[data-parallax]");

let currentBilling = "monthly";
let planCatalog = [];
let adminToken = window.localStorage.getItem("goldenGymAdminToken") || "";
const adminState = {
  memberships: [],
  contacts: [],
  payments: [],
  trainers: [],
  classes: [],
};

const formatCurrency = (amount) => `${CURRENCY_SYMBOL}${Number(amount || 0).toLocaleString("en-IN")}`;

const setStatus = (element, type, message) => {
  if (!element) {
    return;
  }

  element.textContent = message || "";
  element.classList.remove("is-success", "is-error");

  if (type === "success") {
    element.classList.add("is-success");
  }

  if (type === "error") {
    element.classList.add("is-error");
  }
};

const readPricingCards = () =>
  Array.from(priceCards).map((card) => {
    const planName = card.querySelector(".plan-name")?.textContent?.trim() || "";
    const price = card.querySelector(".price");

    return {
      name: planName,
      monthly: Number(String(price?.dataset.monthly || "0").replace(/,/g, "")),
      yearly: Number(String(price?.dataset.yearly || "0").replace(/,/g, "")),
      billingVisibility: (card.dataset.billingVisibility || "monthly yearly").split(" "),
    };
  });

const getAvailablePlans = (mode) => planCatalog.filter((plan) => plan.billingVisibility.includes(mode));

const syncMembershipPlanOptions = (mode) => {
  if (!membershipPlanSelect) {
    return;
  }

  const availablePlans = getAvailablePlans(mode);
  const previousValue = membershipPlanSelect.value;

  membershipPlanSelect.innerHTML = availablePlans
    .map((plan) => `<option value="${plan.name}">${plan.name}</option>`)
    .join("");

  const hasPrevious = availablePlans.some((plan) => plan.name === previousValue);
  membershipPlanSelect.value = hasPrevious ? previousValue : availablePlans[0]?.name || "";
};

const syncMembershipAmount = () => {
  if (!membershipPlanSelect || !membershipBillingSelect || !membershipAmountInput) {
    return;
  }

  const selectedPlan = planCatalog.find((plan) => plan.name === membershipPlanSelect.value);
  const billingMode = membershipBillingSelect.value;

  membershipAmountInput.value = selectedPlan ? selectedPlan[billingMode] || "" : "";
};

const setBilling = (mode) => {
  currentBilling = mode;

  billingButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.billing === mode);
  });

  prices.forEach((price) => {
    const amount = String(price.dataset[mode] || "0").replace(/,/g, "");
    price.textContent = formatCurrency(amount);
  });

  if (pricingGrid) {
    pricingGrid.classList.toggle("is-yearly", mode === "yearly");
  }

  priceCards.forEach((card) => {
    const visibilityModes = (card.dataset.billingVisibility || "monthly yearly").split(" ");
    const isVisible = visibilityModes.includes(mode);
    card.hidden = !isVisible;
    card.setAttribute("aria-hidden", String(!isVisible));
  });

  billingLabels.forEach((label) => {
    label.textContent = mode === "monthly" ? "/ month" : "/ year";
  });

  if (membershipBillingSelect) {
    membershipBillingSelect.value = mode;
  }

  syncMembershipPlanOptions(mode);
  syncMembershipAmount();
};

const closeMenu = () => {
  if (!navMenu || !navToggle) {
    return;
  }

  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

const fetchJSON = async (url, options = {}) => {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Something went wrong.");
  }

  return payload;
};

const renderTrainers = (trainers) => {
  if (!trainerTrack || !trainers.length) {
    return;
  }

  trainerTrack.innerHTML = trainers
    .map(
      (trainer) => `
        <article class="trainer-card">
          <img src="${trainer.imageUrl}" alt="${trainer.name} in the gym" />
          <div class="trainer-info">
            <h3>${trainer.name}</h3>
            <p>${trainer.specialty}</p>
            <span class="rating">${"★".repeat(Math.max(1, Math.min(5, trainer.rating || 5)))}</span>
            <button class="btn btn-primary btn-small" type="button">Book Session</button>
          </div>
        </article>
      `
    )
    .join("");
};

const renderClasses = (classes) => {
  if (!classGrid || !classes.length) {
    return;
  }

  classGrid.innerHTML = classes
    .map(
      (gymClass) => `
        <article class="class-card">
          <p class="class-meta">${gymClass.schedule}</p>
          <h3>${gymClass.title}</h3>
          <p class="class-coach">Coach: ${gymClass.coach}</p>
          <p class="class-copy">${gymClass.description}</p>
          <div class="class-tags">
            <span>${gymClass.duration}</span>
            <span>${gymClass.intensity}</span>
          </div>
        </article>
      `
    )
    .join("");
};

const renderAdminStats = (summary) => {
  if (!adminStats) {
    return;
  }

  const cards = [
    { label: "Memberships", value: summary.membershipCount || 0 },
    { label: "New Leads", value: summary.pendingMemberships || 0 },
    { label: "Payments", value: summary.paymentCount || 0 },
    { label: "Revenue", value: formatCurrency(summary.revenueCollected || 0) },
  ];

  adminStats.innerHTML = cards
    .map(
      (card) => `
        <article class="admin-stat-card">
          <span class="admin-item-subtle">${card.label}</span>
          <strong>${card.value}</strong>
        </article>
      `
    )
    .join("");
};

const renderMemberships = (memberships) => {
  if (!adminMembershipsBody) {
    return;
  }

  if (!memberships.length) {
    adminMembershipsBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No memberships submitted yet.</td>
      </tr>
    `;
    return;
  }

  adminMembershipsBody.innerHTML = memberships
    .map(
      (membership) => `
        <tr>
          <td>
            <strong>${membership.fullName}</strong><br />
            <span class="admin-item-subtle">${membership.email}</span><br />
            <span class="admin-item-subtle">${membership.phone}</span>
          </td>
          <td>${membership.plan}<br /><span class="admin-item-subtle">${membership.billing}</span></td>
          <td>
            <select data-membership-status="${membership._id}">
              <option value="new" ${membership.status === "new" ? "selected" : ""}>New</option>
              <option value="contacted" ${membership.status === "contacted" ? "selected" : ""}>Contacted</option>
              <option value="approved" ${membership.status === "approved" ? "selected" : ""}>Approved</option>
              <option value="rejected" ${membership.status === "rejected" ? "selected" : ""}>Rejected</option>
            </select>
          </td>
          <td>
            <select data-membership-payment="${membership._id}">
              <option value="pending" ${membership.paymentStatus === "pending" ? "selected" : ""}>Pending</option>
              <option value="paid" ${membership.paymentStatus === "paid" ? "selected" : ""}>Paid</option>
              <option value="failed" ${membership.paymentStatus === "failed" ? "selected" : ""}>Failed</option>
              <option value="refunded" ${membership.paymentStatus === "refunded" ? "selected" : ""}>Refunded</option>
            </select>
          </td>
          <td>
            <button class="btn btn-secondary" type="button" data-update-membership="${membership._id}">
              Save
            </button>
          </td>
        </tr>
      `
    )
    .join("");
};

const renderContacts = (contacts) => {
  if (!adminContactsList) {
    return;
  }

  if (!contacts.length) {
    adminContactsList.innerHTML = `<p class="empty-state">No contact enquiries yet.</p>`;
    return;
  }

  adminContactsList.innerHTML = contacts
    .map(
      (contact) => `
        <article class="admin-list-item">
          <div class="admin-item-head">
            <h4>${contact.fullName}</h4>
            <span class="status-pill">${contact.subject || "General enquiry"}</span>
          </div>
          <p>${contact.message}</p>
          <p class="admin-item-subtle">${contact.email}${contact.phone ? ` | ${contact.phone}` : ""}</p>
        </article>
      `
    )
    .join("");
};

const renderPayments = (payments) => {
  if (!adminPaymentsBody) {
    return;
  }

  if (!payments.length) {
    adminPaymentsBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No payment records yet.</td>
      </tr>
    `;
    return;
  }

  adminPaymentsBody.innerHTML = payments
    .map(
      (payment) => `
        <tr>
          <td>${payment.reference}</td>
          <td>
            <strong>${payment.memberName}</strong><br />
            <span class="admin-item-subtle">${payment.plan}</span>
          </td>
          <td>${formatCurrency(payment.amount)}</td>
          <td>
            <select data-payment-status="${payment._id}">
              <option value="pending" ${payment.status === "pending" ? "selected" : ""}>Pending</option>
              <option value="paid" ${payment.status === "paid" ? "selected" : ""}>Paid</option>
              <option value="failed" ${payment.status === "failed" ? "selected" : ""}>Failed</option>
              <option value="refunded" ${payment.status === "refunded" ? "selected" : ""}>Refunded</option>
            </select>
          </td>
          <td>
            <button class="btn btn-secondary" type="button" data-update-payment="${payment._id}">
              Save
            </button>
          </td>
        </tr>
      `
    )
    .join("");
};

const renderTrainerManager = (trainers) => {
  if (!adminTrainersList) {
    return;
  }

  if (!trainers.length) {
    adminTrainersList.innerHTML = `<p class="empty-state">No trainers available.</p>`;
    return;
  }

  adminTrainersList.innerHTML = trainers
    .map(
      (trainer) => `
        <article class="admin-list-item">
          <div class="admin-item-head">
            <h4>${trainer.name}</h4>
            <span class="status-pill">${trainer.specialty}</span>
          </div>
          <p>${trainer.bio}</p>
          <p class="admin-item-subtle">Rating ${trainer.rating}/5 | Order ${trainer.displayOrder}</p>
          <div class="admin-inline-actions">
            <button class="btn btn-secondary" type="button" data-edit-trainer="${trainer._id}">
              Edit
            </button>
            <button class="btn btn-secondary" type="button" data-delete-trainer="${trainer._id}">
              Delete
            </button>
          </div>
        </article>
      `
    )
    .join("");
};

const renderClassManager = (classes) => {
  if (!adminClassesList) {
    return;
  }

  if (!classes.length) {
    adminClassesList.innerHTML = `<p class="empty-state">No classes available.</p>`;
    return;
  }

  adminClassesList.innerHTML = classes
    .map(
      (gymClass) => `
        <article class="admin-list-item">
          <div class="admin-item-head">
            <h4>${gymClass.title}</h4>
            <span class="status-pill">${gymClass.intensity}</span>
          </div>
          <p>${gymClass.description}</p>
          <p class="admin-item-subtle">${gymClass.coach} | ${gymClass.schedule}</p>
          <div class="admin-inline-actions">
            <button class="btn btn-secondary" type="button" data-edit-class="${gymClass._id}">
              Edit
            </button>
            <button class="btn btn-secondary" type="button" data-delete-class="${gymClass._id}">
              Delete
            </button>
          </div>
        </article>
      `
    )
    .join("");
};

const fillTrainerForm = (trainer) => {
  if (!trainerForm || !trainer) {
    return;
  }

  trainerForm.elements.id.value = trainer._id || "";
  trainerForm.elements.name.value = trainer.name || "";
  trainerForm.elements.specialty.value = trainer.specialty || "";
  trainerForm.elements.rating.value = trainer.rating || 5;
  trainerForm.elements.displayOrder.value = trainer.displayOrder || 0;
  trainerForm.elements.imageUrl.value = trainer.imageUrl || "";
  trainerForm.elements.bio.value = trainer.bio || "";
  trainerForm.scrollIntoView({ behavior: "smooth", block: "center" });
};

const fillClassForm = (gymClass) => {
  if (!classForm || !gymClass) {
    return;
  }

  classForm.elements.id.value = gymClass._id || "";
  classForm.elements.title.value = gymClass.title || "";
  classForm.elements.coach.value = gymClass.coach || "";
  classForm.elements.duration.value = gymClass.duration || "";
  classForm.elements.intensity.value = gymClass.intensity || "Medium";
  classForm.elements.schedule.value = gymClass.schedule || "";
  classForm.elements.displayOrder.value = gymClass.displayOrder || 0;
  classForm.elements.description.value = gymClass.description || "";
  classForm.scrollIntoView({ behavior: "smooth", block: "center" });
};

const resetManagerForms = () => {
  trainerForm?.reset();
  classForm?.reset();
  if (trainerForm?.elements.id) {
    trainerForm.elements.id.value = "";
  }
  if (classForm?.elements.id) {
    classForm.elements.id.value = "";
  }
};

const loadPublicData = async () => {
  try {
    const [plans, trainers, classes] = await Promise.all([
      fetchJSON(`${API_BASE}/plans`),
      fetchJSON(`${API_BASE}/trainers`),
      fetchJSON(`${API_BASE}/classes`),
    ]);

    planCatalog = plans;
    renderTrainers(trainers);
    renderClasses(classes);
  } catch (error) {
    console.warn("Public API fallback in use:", error.message);
    planCatalog = readPricingCards();
  }

  syncMembershipPlanOptions(currentBilling);
  syncMembershipAmount();
};

const setAdminSession = (token) => {
  adminToken = token || "";

  if (adminToken) {
    window.localStorage.setItem("goldenGymAdminToken", adminToken);
  } else {
    window.localStorage.removeItem("goldenGymAdminToken");
  }

  if (adminDashboard) {
    adminDashboard.hidden = !adminToken;
  }
};

const loadAdminDashboard = async () => {
  if (!adminToken) {
    setAdminSession("");
    return;
  }

  try {
    const payload = await fetchJSON(`${API_BASE}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    adminState.memberships = payload.memberships || [];
    adminState.contacts = payload.contacts || [];
    adminState.payments = payload.payments || [];
    adminState.trainers = payload.trainers || [];
    adminState.classes = payload.classes || [];

    renderAdminStats(payload.summary || {});
    renderMemberships(adminState.memberships);
    renderContacts(adminState.contacts);
    renderPayments(adminState.payments);
    renderTrainerManager(adminState.trainers);
    renderClassManager(adminState.classes);
    setAdminSession(adminToken);
  } catch (error) {
    setAdminSession("");
    setStatus(adminAuthStatus, "error", error.message);
  }
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

choosePlanButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setBilling(button.dataset.billing || currentBilling);
    if (membershipPlanSelect && button.dataset.plan) {
      membershipPlanSelect.value = button.dataset.plan;
      syncMembershipAmount();
    }
  });
});

membershipBillingSelect?.addEventListener("change", (event) => {
  setBilling(event.target.value);
});

membershipPlanSelect?.addEventListener("change", syncMembershipAmount);

membershipForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(membershipStatus, "", "Submitting membership...");

  try {
    const payload = Object.fromEntries(new FormData(membershipForm).entries());
    const result = await fetchJSON(`${API_BASE}/memberships`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    membershipForm.reset();
    setBilling(currentBilling);
    setStatus(
      membershipStatus,
      "success",
      `${result.message} Reference: ${result.paymentReference}`
    );
  } catch (error) {
    setStatus(membershipStatus, "error", error.message);
  }
});

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(contactStatus, "", "Sending your message...");

  try {
    const payload = Object.fromEntries(new FormData(contactForm).entries());
    const result = await fetchJSON(`${API_BASE}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    contactForm.reset();
    setStatus(contactStatus, "success", result.message);
  } catch (error) {
    setStatus(contactStatus, "error", error.message);
  }
});

adminLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(adminAuthStatus, "", "Signing in...");

  try {
    const credentials = Object.fromEntries(new FormData(adminLoginForm).entries());
    const result = await fetchJSON(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    setAdminSession(result.token);
    setStatus(adminAuthStatus, "success", `Welcome back, ${result.admin.name}.`);
    await loadAdminDashboard();
  } catch (error) {
    setAdminSession("");
    setStatus(adminAuthStatus, "error", error.message);
  }
});

adminLogoutButton?.addEventListener("click", () => {
  setAdminSession("");
  setStatus(adminAuthStatus, "success", "Admin session cleared.");
});

trainerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(trainerFormStatus, "", "Saving trainer...");

  try {
    const formData = new FormData(trainerForm);
    const trainerId = formData.get("id");
    const payload = {
      name: formData.get("name"),
      specialty: formData.get("specialty"),
      rating: Number(formData.get("rating") || 5),
      displayOrder: Number(formData.get("displayOrder") || 0),
      imageUrl: formData.get("imageUrl"),
      bio: formData.get("bio"),
    };

    await fetchJSON(`${API_BASE}/admin/trainers${trainerId ? `/${trainerId}` : ""}`, {
      method: trainerId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(payload),
    });

    trainerForm.reset();
    trainerForm.elements.id.value = "";
    setStatus(trainerFormStatus, "success", "Trainer saved successfully.");
    await loadAdminDashboard();
    await loadPublicData();
  } catch (error) {
    setStatus(trainerFormStatus, "error", error.message);
  }
});

classForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(classFormStatus, "", "Saving class...");

  try {
    const formData = new FormData(classForm);
    const classId = formData.get("id");
    const payload = {
      title: formData.get("title"),
      coach: formData.get("coach"),
      duration: formData.get("duration"),
      intensity: formData.get("intensity"),
      schedule: formData.get("schedule"),
      displayOrder: Number(formData.get("displayOrder") || 0),
      description: formData.get("description"),
    };

    await fetchJSON(`${API_BASE}/admin/classes${classId ? `/${classId}` : ""}`, {
      method: classId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(payload),
    });

    classForm.reset();
    classForm.elements.id.value = "";
    setStatus(classFormStatus, "success", "Class saved successfully.");
    await loadAdminDashboard();
    await loadPublicData();
  } catch (error) {
    setStatus(classFormStatus, "error", error.message);
  }
});

trainerFormReset?.addEventListener("click", () => {
  trainerForm.elements.id.value = "";
  setStatus(trainerFormStatus, "", "");
});

classFormReset?.addEventListener("click", () => {
  classForm.elements.id.value = "";
  setStatus(classFormStatus, "", "");
});

document.addEventListener("click", async (event) => {
  if (navMenu && navToggle && !navMenu.contains(event.target) && !navToggle.contains(event.target)) {
    closeMenu();
  }

  const membershipUpdateButton = event.target.closest("[data-update-membership]");
  const paymentUpdateButton = event.target.closest("[data-update-payment]");
  const trainerDeleteButton = event.target.closest("[data-delete-trainer]");
  const classDeleteButton = event.target.closest("[data-delete-class]");
  const trainerEditButton = event.target.closest("[data-edit-trainer]");
  const classEditButton = event.target.closest("[data-edit-class]");

  if (trainerEditButton) {
    const trainer = adminState.trainers.find((item) => item._id === trainerEditButton.dataset.editTrainer);
    fillTrainerForm(trainer);
  }

  if (classEditButton) {
    const gymClass = adminState.classes.find((item) => item._id === classEditButton.dataset.editClass);
    fillClassForm(gymClass);
  }

  if (membershipUpdateButton) {
    try {
      const membershipId = membershipUpdateButton.dataset.updateMembership;
      const status = document.querySelector(`[data-membership-status="${membershipId}"]`)?.value;
      const paymentStatus = document.querySelector(`[data-membership-payment="${membershipId}"]`)?.value;

      await fetchJSON(`${API_BASE}/admin/memberships/${membershipId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status, paymentStatus }),
      });

      await loadAdminDashboard();
    } catch (error) {
      setStatus(adminAuthStatus, "error", error.message);
    }
  }

  if (paymentUpdateButton) {
    try {
      const paymentId = paymentUpdateButton.dataset.updatePayment;
      const status = document.querySelector(`[data-payment-status="${paymentId}"]`)?.value;

      await fetchJSON(`${API_BASE}/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });

      await loadAdminDashboard();
    } catch (error) {
      setStatus(adminAuthStatus, "error", error.message);
    }
  }

  if (trainerDeleteButton) {
    try {
      await fetchJSON(`${API_BASE}/admin/trainers/${trainerDeleteButton.dataset.deleteTrainer}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      await loadAdminDashboard();
      await loadPublicData();
      resetManagerForms();
    } catch (error) {
      setStatus(trainerFormStatus, "error", error.message);
    }
  }

  if (classDeleteButton) {
    try {
      await fetchJSON(`${API_BASE}/admin/classes/${classDeleteButton.dataset.deleteClass}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      await loadAdminDashboard();
      await loadPublicData();
      resetManagerForms();
    } catch (error) {
      setStatus(classFormStatus, "error", error.message);
    }
  }
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
    threshold: 0.18,
  }
);

revealItems.forEach((item) => {
  if (!item.classList.contains("reveal-hero")) {
    revealObserver.observe(item);
  }
});

const handleScroll = () => {
  const scrollTop = window.scrollY;

  navbar?.classList.toggle("is-scrolled", scrollTop > 24);

  if (parallaxTarget) {
    const offset = Math.min(scrollTop * 0.16, 48);
    const scale = 1.06 + Math.min(scrollTop * 0.00008, 0.03);
    parallaxTarget.style.transform = `translateY(${offset}px) scale(${scale})`;
  }
};

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("load", async () => {
  planCatalog = readPricingCards();
  setBilling("monthly");
  handleScroll();
  await loadPublicData();

  if (adminToken) {
    await loadAdminDashboard();
  }
});
