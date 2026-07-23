/* =========================================================
   Pedro Daguer · Portfolio interactions
   Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav scroll state + progress ---------- */
  const nav = document.getElementById("nav");
  const progress = document.querySelector(".scroll-progress span");
  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 40);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobileMenu");
  function toggleMenu(force) {
    const open = force !== undefined ? force : !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", () => toggleMenu());
  if (menu) menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ---------- Smooth anchor scroll with nav offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const siblings = Array.from(entry.target.parentElement.children).filter((c) => c.classList.contains("reveal"));
            const idx = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = Math.min(idx, 6) * 0.07 + "s";
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Hero word rotator ---------- */
  const rotator = document.getElementById("rotator");
  if (rotator && !prefersReduced) {
    const words = ["pixel final", "backend", "pipeline", "API REST", "produto web"];
    let i = 0;
    const span = rotator.querySelector("span");
    setInterval(() => {
      span.style.opacity = "0";
      span.style.transform = "translateY(-8px)";
      span.style.transition = "opacity .3s ease, transform .3s ease";
      setTimeout(() => {
        i = (i + 1) % words.length;
        span.textContent = words[i];
        span.style.opacity = "1";
        span.style.transform = "translateY(0)";
      }, 320);
    }, 2600);
  }

  /* ---------- Custom cursor ---------- */
  if (!isTouch && !prefersReduced) {
    const ring = document.querySelector(".cursor");
    const dot = document.querySelector(".cursor-dot");
    if (ring && dot) {
      document.body.classList.add("cursor-ready");
      let mx = window.innerWidth / 2, my = window.innerHeight / 2;
      let rx = mx, ry = my;
      window.addEventListener("mousemove", (e) => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      });
      (function loop() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
      })();
      document.querySelectorAll("a, button, [data-hover], input, textarea, select").forEach((el) => {
        el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
        el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
      });
    }
  }

  /* ---------- Card tilt ---------- */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `translateY(-5px) perspective(800px) rotateX(${-py * 5}deg) rotateY(${px * 5}deg)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Hero network canvas ---------- */
  const canvas = document.getElementById("net");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, nodes = [], mouse = { x: -9999, y: -9999 };

    const palette = { line: "119,141,169", node: "224,225,221", accent: "65,90,119" };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
      const count = Math.min(Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 15000), 90);
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28 * dpr,
          vy: (Math.random() - 0.5) * 0.28 * dpr,
          r: (Math.random() * 1.6 + 0.6) * dpr,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const maxD = 150 * dpr;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // mouse gravity
        const dxm = n.x - mouse.x, dym = n.y - mouse.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 160 * dpr) {
          n.x += (dxm / dm) * 0.6;
          n.y += (dym / dm) * 0.6;
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x, dy = n.y - m.y;
          const d = Math.hypot(dx, dy);
          if (d < maxD) {
            const a = (1 - d / maxD) * 0.5;
            ctx.strokeStyle = `rgba(${palette.line},${a})`;
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${palette.node},0.8)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    const hero = document.querySelector(".hero");
    window.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * dpr;
      mouse.y = (e.clientY - r.top) * dpr;
    });
    if (hero) hero.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });

    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
    resize();
    draw();
  }

  /* ---------- Contact form (WhatsApp / email, no backend) ---------- */
  const form = document.getElementById("contactForm");
  if (form) {
    const WHATS = "5547991975210"; // 55 + 47 + 9 9197 5210 (13 digits)
    const EMAIL = "pedrodaguer.dev@gmail.com";

    function compose() {
      const nome = form.nome.value.trim();
      const email = form.email.value.trim();
      const tipo = form.tipo.value;
      const msg = form.mensagem.value.trim();
      return { nome, email, tipo, msg };
    }
    function valid(d) {
      if (!d.nome || !d.email || !d.msg) { alert("Preencha nome, email e mensagem."); return false; }
      return true;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = compose();
      if (!valid(d)) return;
      const raw =
        `Olá Pedro! Sou ${d.nome}.\n` +
        `Assunto: ${d.tipo}\n\n` +
        `${d.msg}\n\n` +
        `(meu email: ${d.email})`;
      window.open(`https://api.whatsapp.com/send/?phone=${WHATS}&text=${encodeURIComponent(raw)}`, "_blank", "noopener");
    });

    const mailBtn = document.getElementById("mailBtn");
    if (mailBtn) {
      mailBtn.addEventListener("click", () => {
        const d = compose();
        if (!valid(d)) return;
        const subject = encodeURIComponent(`[Site] ${d.tipo} - ${d.nome}`);
        const body = encodeURIComponent(`${d.msg}\n\nContato: ${d.email}`);
        window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
      });
    }
  }
})();
