const root = document.documentElement;
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const projectPreviews = Array.from(document.querySelectorAll("[data-project-preview]"));
const countUpItems = Array.from(document.querySelectorAll("[data-count-up]"));
const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const dashboardDesktop = window.matchMedia("(min-width: 1100px) and (min-height: 650px)");
const projectRail = document.querySelector("[data-project-rail]");
const projectViewport = projectRail?.closest(".dash-project-viewport");
const projectDialogLayer = document.querySelector("[data-project-dialog]");
const projectDialog = projectDialogLayer?.querySelector(".project-dialog");

const projectDetails = {
  jechacks: {
    meta: "Community / Online event",
    title: "JecHacks",
    date: "2026",
    role: "Co-founder and main organizer",
    status: "Live student event",
    summary:
      "A free online hackathon for high-school students. I co-founded the event, led prize and social planning, handled sponsor outreach, and helped bring in more than 120 student entrants and $5,300 in funding.",
    decision:
      "Keep the event free, fully online, and beginner-friendly, with one focused 12-hour build window.",
    tags: ["Community", "Partnerships", "Event operations", "Social media"],
    links: [{ label: "Visit JecHacks", href: "https://www.jechacks.com/" }],
  },
  safewalk: {
    meta: "Navigation / EurekaHacks",
    title: "SafeWalk",
    date: "2026",
    role: "Routing, scoring, UX, and deployment",
    status: "Live hackathon prototype",
    summary:
      "A pedestrian navigation tool that compares routes using lighting and environmental safety signals, not only travel time. I worked across routing, safety scoring, the responsive map and sidebar, deployment, and last-minute bug fixes.",
    decision:
      "Make every route recommendation explainable so users can understand why one path scores better than another.",
    tags: ["React", "Flask", "OpenStreetMap", "Overpass API"],
    links: [
      { label: "Open live project", href: "https://safewalk-eurekahacks.vercel.app/" },
      { label: "View GitHub", href: "https://github.com/olinho11/EurekaHacks26-SafeWalk" },
      { label: "View project entry", href: "https://devpost.com/software/safe-steps-w1o9fp" },
    ],
  },
  "three-body": {
    meta: "Physics / Interactive lab",
    title: "Three-Body Problem Simulator",
    date: "2026",
    role: "Independent developer",
    status: "Live experiment",
    summary:
      "An interactive gravitational laboratory with presets, live analytics, chaos detection, trajectory prediction, and direct body controls.",
    decision:
      "Expose RK4, Verlet, and Euler integrators beside live system metrics so the simulation teaches the numerical methods instead of only animating them.",
    tags: ["JavaScript", "Canvas", "Numerical methods", "Physics"],
    links: [{ label: "Launch simulator", href: "https://3-body-problem.vercel.app/" }],
  },
  projectpacket: {
    meta: "SaaS / Product build",
    title: "ProjectPacket",
    date: "2026",
    role: "Research, product, and full-stack build",
    status: "Live SaaS MVP",
    summary:
      "A client asset collection product with private packet links, dashboards, templates, approvals, passcodes, and expiry controls.",
    decision:
      "Let clients submit through one no-account link while keeping passcode and expiry checks enforced on the server.",
    tags: ["Next.js", "TypeScript", "Supabase", "Product design"],
    links: [{ label: "Visit ProjectPacket", href: "https://www.projectpacket.site/" }],
  },
};

root.classList.add("js");

const numberFormatter = new Intl.NumberFormat("en-US");
let countObserver = null;

function setCountValue(item, value) {
  const prefix = item.dataset.prefix || "";
  const suffix = item.dataset.suffix || "";
  item.textContent = prefix + numberFormatter.format(value) + suffix;
}

function finishCountUp(item) {
  const target = Number(item.dataset.target || 0);
  setCountValue(item, target);
  item.classList.add("is-counted");
  item.closest(".achievement-stat")?.classList.add("is-counted");
}

function animateCountUp(item) {
  if (item.dataset.counted === "true") return;

  item.dataset.counted = "true";
  const target = Number(item.dataset.target || 0);
  const duration = target >= 1000 ? 2400 : 1450;
  const startedAt = performance.now();

  function updateCount(now) {
    if (document.hidden) {
      finishCountUp(item);
      return;
    }

    const progress = Math.min(1, (now - startedAt) / duration);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    setCountValue(item, Math.round(target * easedProgress));

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      finishCountUp(item);
    }
  }

  requestAnimationFrame(updateCount);
}

if (countUpItems.length) {
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    countUpItems.forEach(finishCountUp);
  } else {
    countUpItems.forEach((item) => setCountValue(item, 0));

    countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          animateCountUp(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px",
        threshold: 0.75,
      },
    );

    countUpItems.forEach((item) => countObserver.observe(item));
  }
}

function showAllRevealItems() {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  showAllRevealItems();
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.08,
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
  root.classList.add("reveal-ready");
}

const trackedSections = Array.from(
  document.querySelectorAll("#work, #about, #contact"),
);

if ("IntersectionObserver" in window && trackedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      const activeHash = "#" + visibleEntry.target.id;

      navLinks.forEach((link) => {
        if (link.getAttribute("href") === activeHash) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    {
      rootMargin: "-25% 0px -55% 0px",
      threshold: [0.05, 0.2, 0.45],
    },
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
}

function resetPreview(preview) {
  preview.style.removeProperty("--pointer-x");
  preview.style.removeProperty("--pointer-y");
  preview.style.removeProperty("--rotate-x");
  preview.style.removeProperty("--rotate-y");
}

projectPreviews.forEach((preview) => {
  preview.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches || document.hidden) return;

    const bounds = preview.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));

    preview.style.setProperty("--pointer-x", String(x * 100) + "%");
    preview.style.setProperty("--pointer-y", String(y * 100) + "%");
    preview.style.setProperty("--rotate-x", String((0.5 - y) * 2.5) + "deg");
    preview.style.setProperty("--rotate-y", String((x - 0.5) * 3.5) + "deg");
  });

  preview.addEventListener("pointerleave", () => resetPreview(preview));
  preview.addEventListener("blur", () => resetPreview(preview));
});

let projectRailClones = [];
let projectRailResizeFrame = 0;
let lastProjectRailViewportWidth = 0;

function getOriginalProjectCards() {
  if (!projectRail) return [];
  return Array.from(projectRail.children).filter(
    (card) => !card.classList.contains("dash-project-clone"),
  );
}

function stopProjectRail() {
  if (!projectRail) return;

  if (projectRailResizeFrame) {
    cancelAnimationFrame(projectRailResizeFrame);
    projectRailResizeFrame = 0;
  }

  projectRail.classList.remove("is-looping", "is-paused", "is-resuming");
  projectRailClones.forEach((clone) => clone.remove());
  projectRailClones = [];
  lastProjectRailViewportWidth = 0;
  projectRail.style.removeProperty("--rail-shift");
  projectRail.style.removeProperty("--rail-duration");
}

function startProjectRail({ force = false } = {}) {
  if (!projectRail || !projectViewport) return;

  if (reducedMotion.matches || !finePointer.matches || !dashboardDesktop.matches) {
    stopProjectRail();
    return;
  }

  const viewportWidth = projectViewport.getBoundingClientRect().width;
  if (!viewportWidth) return;

  if (
    !force &&
    projectRailClones.length &&
    Math.abs(viewportWidth - lastProjectRailViewportWidth) < 1
  ) {
    return;
  }

  projectRailClones.forEach((clone) => clone.remove());
  projectRailClones = [];
  projectRail.classList.remove("is-looping", "is-resuming");
  projectRail.style.removeProperty("--rail-shift");
  projectRail.style.removeProperty("--rail-duration");

  const originalCards = getOriginalProjectCards();
  if (!originalCards.length) return;

  projectRail.classList.add("is-looping", "is-paused");

  const railStyles = window.getComputedStyle(projectRail);
  const railGap = Number.parseFloat(railStyles.columnGap || railStyles.gap) || 0;
  const projectSetWidth =
    originalCards.reduce((total, card) => total + card.getBoundingClientRect().width, 0) +
    railGap * originalCards.length;

  if (!projectSetWidth) {
    stopProjectRail();
    return;
  }

  const totalSets = Math.max(2, Math.ceil(viewportWidth / projectSetWidth) + 1);

  for (let setIndex = 1; setIndex < totalSets; setIndex += 1) {
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.classList.add("dash-project-clone");
      clone.setAttribute("aria-hidden", "true");
      clone.setAttribute("tabindex", "-1");
      clone.querySelectorAll("a, button, [tabindex]").forEach((control) => {
        control.setAttribute("tabindex", "-1");
      });
      projectRail.appendChild(clone);
      projectRailClones.push(clone);
    });
  }

  const measuredSetWidth =
    projectRailClones[0].getBoundingClientRect().left -
    originalCards[0].getBoundingClientRect().left;
  const loopDistance = measuredSetWidth || projectSetWidth;

  projectRail.style.setProperty("--rail-shift", String(-loopDistance) + "px");
  projectRail.style.setProperty(
    "--rail-duration",
    String(Math.max(24, loopDistance / 40)) + "s",
  );
  lastProjectRailViewportWidth = viewportWidth;

  requestAnimationFrame(() => {
    if (!document.hidden) projectRail.classList.remove("is-paused");
  });
}

function scheduleProjectRailRebuild() {
  if (projectRailResizeFrame) cancelAnimationFrame(projectRailResizeFrame);
  projectRailResizeFrame = requestAnimationFrame(() => {
    projectRailResizeFrame = 0;
    startProjectRail({ force: true });
  });
}

let lastProjectTrigger = null;
let lastProjectTriggerWasPointer = false;

function closeProjectDialog() {
  if (!projectDialogLayer || projectDialogLayer.hidden) return;

  projectDialogLayer.classList.remove("is-open");
  document.body.classList.remove("project-dialog-open");

  window.setTimeout(() => {
    projectDialogLayer.hidden = true;

    if (lastProjectTriggerWasPointer) {
      lastProjectTrigger?.blur();
      projectRail?.classList.add("is-resuming");
    } else {
      lastProjectTrigger?.focus();
    }
  }, 180);
}

function openProjectDialog(projectId, trigger, openedWithPointer = false) {
  if (!projectDialogLayer || !projectDialog) return;

  const details = projectDetails[projectId];
  if (!details) return;

  projectDialogLayer.querySelector("[data-dialog-meta]").textContent = details.meta;
  projectDialogLayer.querySelector("[data-dialog-title]").textContent = details.title;
  projectDialogLayer.querySelector("[data-dialog-summary]").textContent = details.summary;
  projectDialogLayer.querySelector("[data-dialog-date]").textContent = details.date;
  projectDialogLayer.querySelector("[data-dialog-role]").textContent = details.role;
  projectDialogLayer.querySelector("[data-dialog-status]").textContent = details.status;
  projectDialogLayer.querySelector("[data-dialog-decision]").textContent = details.decision;

  const tagsTarget = projectDialogLayer.querySelector("[data-dialog-tags]");
  const linksTarget = projectDialogLayer.querySelector("[data-dialog-links]");
  tagsTarget.replaceChildren();
  linksTarget.replaceChildren();

  details.tags.forEach((tag) => {
    const item = document.createElement("li");
    item.textContent = tag;
    tagsTarget.appendChild(item);
  });

  details.links.forEach((link) => {
    const anchor = document.createElement("a");
    const action = document.createElement("span");
    anchor.href = link.href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.label;
    action.textContent = "Open";
    anchor.appendChild(action);
    linksTarget.appendChild(anchor);
  });

  lastProjectTrigger = trigger;
  lastProjectTriggerWasPointer = openedWithPointer;
  projectRail?.classList.remove("is-resuming");
  projectDialogLayer.hidden = false;
  document.body.classList.add("project-dialog-open");
  requestAnimationFrame(() => projectDialogLayer.classList.add("is-open"));
  projectDialogLayer.querySelector(".project-dialog-close").focus();
}

projectRail?.addEventListener("click", (event) => {
  const eventTarget = event.target instanceof Element ? event.target : null;
  const trigger = eventTarget?.closest("[data-project-id]");
  if (!trigger) return;
  openProjectDialog(trigger.dataset.projectId, trigger, event.detail > 0);
});

projectDialogLayer?.querySelectorAll("[data-dialog-close]").forEach((control) => {
  control.addEventListener("click", closeProjectDialog);
});

projectDialog?.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;

  const focusable = Array.from(projectDialog.querySelectorAll("button, a[href]"));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

projectViewport?.addEventListener("pointerleave", () => {
  projectRail?.classList.remove("is-resuming");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeProjectDialog();
});

startProjectRail();
finePointer.addEventListener("change", scheduleProjectRailRebuild);
dashboardDesktop.addEventListener("change", scheduleProjectRailRebuild);

if (projectViewport && "ResizeObserver" in window) {
  const projectRailResizeObserver = new ResizeObserver(scheduleProjectRailRebuild);
  projectRailResizeObserver.observe(projectViewport);
} else {
  window.addEventListener("resize", scheduleProjectRailRebuild, { passive: true });
}

document.addEventListener("visibilitychange", () => {
  projectRail?.classList.toggle("is-paused", document.hidden);

  if (document.hidden) {
    projectPreviews.forEach(resetPreview);
  }
});

reducedMotion.addEventListener("change", (event) => {
  if (!event.matches) {
    scheduleProjectRailRebuild();
    return;
  }

  root.classList.remove("reveal-ready");
  showAllRevealItems();
  projectPreviews.forEach(resetPreview);
  stopProjectRail();
  countObserver?.disconnect();
  countUpItems.forEach(finishCountUp);
});

const yearTarget = document.querySelector("[data-current-year]");

if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}
