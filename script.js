const loaderScreen = document.querySelector(".loader-screen");

if (loaderScreen) {
  const loaderStartedAt = performance.now();
  const minimumLoaderTime = 950;
  const maximumLoaderTime = 2400;
  let loaderHidden = false;

  function hideLoader() {
    if (loaderHidden) return;

    loaderHidden = true;
    loaderScreen.setAttribute("aria-hidden", "true");
    loaderScreen.classList.add("is-hidden");

    window.setTimeout(() => {
      loaderScreen.remove();
    }, 620);
  }

  function hideLoaderAfterMinimum() {
    const elapsed = performance.now() - loaderStartedAt;
    const remaining = Math.max(0, minimumLoaderTime - elapsed);
    window.setTimeout(hideLoader, remaining);
  }

  if (document.readyState === "complete") {
    hideLoaderAfterMinimum();
  } else {
    window.addEventListener("load", hideLoaderAfterMinimum, { once: true });
    window.setTimeout(hideLoader, maximumLoaderTime);
  }
}

const projects = document.querySelectorAll(".project-item");
const canvas = document.querySelector("#physics-canvas");
const contactLinks = document.querySelectorAll("[data-contact-message]");
const contactCreature = document.querySelector(".contact-creature");
const creatureBubble = document.querySelector(".creature-bubble");

projects.forEach((project) => {
  project.addEventListener("pointerenter", () => {
    projects.forEach((item) => item.classList.remove("is-active"));
    project.classList.add("is-active");
  });
});

if (projects.length) {
  projects[0].classList.add("is-active");
}

if (contactCreature && creatureBubble) {
  const defaultMessage = creatureBubble.textContent;
  const accents = ["#e5562f", "#4f7d5b", "#3159d4"];
  let happyTimer;

  contactLinks.forEach((link, index) => {
    link.addEventListener("pointerenter", () => {
      creatureBubble.textContent = link.dataset.contactMessage;
      contactCreature.classList.add("is-curious");
      contactCreature.style.setProperty("--creature-accent", accents[index] || accents[0]);
    });

    link.addEventListener("focus", () => {
      creatureBubble.textContent = link.dataset.contactMessage;
      contactCreature.classList.add("is-curious");
      contactCreature.style.setProperty("--creature-accent", accents[index] || accents[0]);
    });
  });

  contactCreature.addEventListener("click", () => {
    window.clearTimeout(happyTimer);
    creatureBubble.textContent = "Hey! Glad you stopped by.";
    contactCreature.classList.add("is-curious");
    contactCreature.classList.add("is-happy");
    happyTimer = window.setTimeout(() => {
      contactCreature.classList.remove("is-happy");
    }, 1400);
  });

  document.querySelector(".contact-section")?.addEventListener("pointerleave", () => {
    creatureBubble.textContent = defaultMessage;
    contactCreature.classList.remove("is-curious");
    contactCreature.classList.remove("is-happy");
  });
}

if (canvas) {
  const ctx = canvas.getContext("2d");
  const points = Array.from({ length: 16 }, (_, index) => ({
    x: 0,
    y: 0,
    vx: (index % 2 ? 1 : -1) * (0.4 + Math.random() * 0.65),
    vy: (index % 3 ? -1 : 1) * (0.35 + Math.random() * 0.55),
    r: 4 + (index % 3),
  }));

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    points.forEach((point) => {
      point.x = Math.random() * rect.width;
      point.y = Math.random() * rect.height;
    });
  }

  function drawPhysics() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    points.forEach((point) => {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < point.r || point.x > width - point.r) point.vx *= -1;
      if (point.y < point.r || point.y > height - point.r) point.vy *= -1;

      point.x = Math.max(point.r, Math.min(width - point.r, point.x));
      point.y = Math.max(point.r, Math.min(height - point.r, point.y));
    });

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);

        if (distance < 135) {
          ctx.strokeStyle = `rgba(23, 22, 18, ${1 - distance / 135})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    points.forEach((point, index) => {
      ctx.fillStyle = index % 3 === 0 ? "#e5562f" : index % 3 === 1 ? "#3159d4" : "#4f7d5b";
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(drawPhysics);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  drawPhysics();
}
