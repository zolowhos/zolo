(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("particles");

  if (canvas && !reduceMotion && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const ZONE_DESKTOP = 0.22;
    const ZONE_MOBILE = 0.12;
    const MARGIN = 40;
    const isMobile = () => window.matchMedia("(max-width: 900px)").matches;
    const zone = () => (isMobile() ? ZONE_MOBILE : ZONE_DESKTOP);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const viewW = () => window.innerWidth;
    const viewH = () => window.innerHeight;
    const scrollY = () => window.scrollY || window.pageYOffset || 0;
    const docHeight = () =>
      Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        viewH()
      );

    const randInZone = () => {
      const w = viewW();
      const z = zone();
      return Math.random() < 0.5
        ? Math.random() * w * z
        : w - Math.random() * w * z;
    };

    const counts = () =>
      isMobile() ? { small: 28, bright: 5 } : { small: 55, bright: 10 };

    const makeParticle = (small) => {
      const y0 = scrollY();
      const h = viewH();
      return {
        x: randInZone(),
        // Document-space Y: pinned to the page, not the viewport
        docY: y0 + Math.random() * h,
        r: small ? Math.random() * 1.4 + 0.3 : Math.random() * 2.5 + 1.5,
        vx: (Math.random() - 0.5) * (small ? 0.18 : 0.07),
        vy: (Math.random() - 0.5) * (small ? 0.18 : 0.07),
        alpha: small ? Math.random() * 0.18 + 0.04 : Math.random() * 0.35 + 0.25,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: small ? Math.random() * 0.012 + 0.004 : Math.random() * 0.007 + 0.003,
        small,
      };
    };

    const respawn = (p) => {
      const y0 = scrollY();
      const h = viewH();
      const maxY = docHeight();
      // Prefer filling the current view; clamp to page bounds
      let next = y0 + Math.random() * h;
      if (next > maxY - 8) next = Math.random() * Math.min(h, maxY);
      p.x = randInZone();
      p.docY = next;
      p.r = p.small ? Math.random() * 1.4 + 0.3 : Math.random() * 2.5 + 1.5;
      p.vx = (Math.random() - 0.5) * (p.small ? 0.18 : 0.07);
      p.vy = (Math.random() - 0.5) * (p.small ? 0.18 : 0.07);
      p.alpha = p.small ? Math.random() * 0.18 + 0.04 : Math.random() * 0.35 + 0.25;
      p.pulse = Math.random() * Math.PI * 2;
    };

    const c0 = counts();
    const particles = Array.from({ length: c0.small }, () => makeParticle(true));
    const intense = Array.from({ length: c0.bright }, () => makeParticle(false));
    const all = particles.concat(intense);

    const step = (p) => {
      const w = viewW();
      const h = viewH();
      const y0 = scrollY();
      const z = zone();

      p.pulse += p.pulseSpeed;
      p.x += p.vx;
      p.docY += p.vy;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      const leftMax = w * z;
      const rightMin = w * (1 - z);
      if (p.x > leftMax && p.x < rightMin) {
        p.x = Math.random() < 0.5 ? leftMax : rightMin;
        p.vx *= -1;
      }

      // Screen Y from document position — scrolls away with the page
      const screenY = p.docY - y0;

      // Off-screen: hide by replacing with a new particle in view
      if (screenY < -MARGIN || screenY > h + MARGIN) {
        respawn(p);
      }
    };

    const draw = () => {
      const w = viewW();
      const h = viewH();
      const y0 = scrollY();
      ctx.clearRect(0, 0, w, h);

      all.forEach(step);

      const screenOf = (p) => ({ x: p.x, y: p.docY - y0 });

      particles.forEach((p) => {
        const { x, y } = screenOf(p);
        if (y < -MARGIN || y > h + MARGIN) return;
        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 200, 200, ${a})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const ps = screenOf(p);
        if (ps.y < -MARGIN || ps.y > h + MARGIN) continue;
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const qs = screenOf(q);
          if (qs.y < -MARGIN || qs.y > h + MARGIN) continue;
          const dx = ps.x - qs.x;
          const dy = ps.y - qs.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(ps.x, ps.y);
            ctx.lineTo(qs.x, qs.y);
            ctx.strokeStyle = `rgba(180, 180, 180, ${(1 - dist / 60) * 0.045})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      intense.forEach((p) => {
        const { x, y } = screenOf(p);
        if (y < -MARGIN || y > h + MARGIN) return;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77, 172, 255, ${a * 0.1})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    draw();
  }

  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const toggle = document.querySelector(".nav-toggle");
  const backdrop = document.querySelector("[data-menu-backdrop]");
  const siteHeader = document.querySelector("[data-site-header]");
  const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
  const dotLinks = [...document.querySelectorAll('.nav-dots a[href^="#"]')];
  const allSectionLinks = [...navLinks, ...dotLinks];
  const sections = [
    ...new Map(
      allSectionLinks
        .map((link) => {
          const id = link.getAttribute("href").slice(1);
          const el = document.getElementById(id);
          return el ? [id, el] : null;
        })
        .filter(Boolean)
    ).values(),
  ];

  const setActiveLink = (id) => {
    [...navLinks, ...dotLinks].forEach((link) => {
      const match = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", match);
      if (match) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const setMenuOpen = (open) => {
    if (!mobileMenu || !toggle) return;
    mobileMenu.classList.toggle("is-open", open);
    if (open) mobileMenu.removeAttribute("hidden");
    else mobileMenu.setAttribute("hidden", "");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (siteHeader) siteHeader.classList.toggle("is-menu-open", open);
    if (backdrop) {
      backdrop.classList.toggle("is-open", open);
      if (open) backdrop.removeAttribute("hidden");
      else backdrop.setAttribute("hidden", "");
    }
    document.body.style.overflow = open ? "hidden" : "";
  };

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      setMenuOpen(!mobileMenu.classList.contains("is-open"));
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => setMenuOpen(false));
  }

  let clickLockId = null;
  let clickLockUntil = 0;

  allSectionLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const id = (link.getAttribute("href") || "").slice(1);
      if (id) {
        setActiveLink(id);
        clickLockId = id;
        clickLockUntil = Date.now() + 700;
      }
      setMenuOpen(false);
    });
  });

  document.querySelectorAll(".nav-social-mobile a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  const floating = document.querySelector("[data-desktop-nav]");

  const visibleRatio = (el) => {
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    const top = Math.max(rect.top, 0);
    const bottom = Math.min(rect.bottom, viewH);
    const visible = Math.max(0, bottom - top);
    return visible / viewH;
  };

  const updateActiveFromScroll = () => {
    if (document.body.classList.contains("is-bible-open")) return;

    if (floating) {
      floating.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    if (clickLockId && Date.now() < clickLockUntil) {
      setActiveLink(clickLockId);
      return;
    }
    clickLockId = null;

    if (!sections.length) return;

    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) {
      setActiveLink(sections[sections.length - 1].id);
      return;
    }

    let best = sections[0];
    let bestScore = -1;

    for (const section of sections) {
      const score = visibleRatio(section);
      if (score > bestScore) {
        bestScore = score;
        best = section;
      }
    }

    setActiveLink(best.id);
  };

  window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
  window.addEventListener("resize", updateActiveFromScroll);
  updateActiveFromScroll();

  const reveals = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
  );

  reveals.forEach((el) => observer.observe(el));
})();
