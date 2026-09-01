(() => {
  const escapeHtml = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const inline = (text) => {
    let s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(
      /\[([^\]]+)\]\((https?:[^)\s]+|\/[^)\s]*|[^)\s]+\.html[^)\s]*)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    return s;
  };

  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/[^\w\s)-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const renderMarkdown = (md) => {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    const html = [];
    const toc = [];
    let i = 0;
    let inCode = false;
    let codeLang = "";
    let codeBuf = [];
    let inList = null;
    let inTable = false;
    let tableBuf = [];

    const closeList = () => {
      if (inList) {
        html.push(`</${inList}>`);
        inList = null;
      }
    };

    const flushTable = () => {
      if (!inTable || !tableBuf.length) return;
      const rows = tableBuf.filter((r) => !/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(r));
      if (!rows.length) {
        inTable = false;
        tableBuf = [];
        return;
      }
      html.push("<table>");
      rows.forEach((row, idx) => {
        const cells = row
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
        const tag = idx === 0 ? "th" : "td";
        html.push("<tr>");
        cells.forEach((c) => html.push(`<${tag}>${inline(c)}</${tag}>`));
        html.push("</tr>");
      });
      html.push("</table>");
      inTable = false;
      tableBuf = [];
    };

    while (i < lines.length) {
      const line = lines[i];

      if (inCode) {
        if (line.startsWith("```")) {
          html.push(
            `<div class="code-block"><button type="button" class="code-copy" aria-label="Select code to copy" title="Select"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button><pre tabindex="0"><code class="language-${escapeHtml(codeLang)}">${escapeHtml(
              codeBuf.join("\n")
            )}</code></pre></div>`
          );
          inCode = false;
          codeBuf = [];
          codeLang = "";
        } else {
          codeBuf.push(line);
        }
        i += 1;
        continue;
      }

      if (line.startsWith("```")) {
        closeList();
        flushTable();
        inCode = true;
        codeLang = line.slice(3).trim();
        i += 1;
        continue;
      }

      if (/^\s*\|/.test(line) && line.includes("|")) {
        closeList();
        inTable = true;
        tableBuf.push(line);
        i += 1;
        continue;
      }
      if (inTable) flushTable();

      if (/^---+\s*$/.test(line)) {
        closeList();
        html.push("<hr>");
        i += 1;
        continue;
      }

      const h = line.match(/^(#{1,3})\s+(.+)$/);
      if (h) {
        closeList();
        const level = h[1].length;
        const text = h[2].trim();
        const id = slugify(text);
        html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
        if (level === 2) toc.push({ id, text });
        i += 1;
        continue;
      }

      const ul = line.match(/^[-*]\s+(.+)$/);
      if (ul) {
        if (inList !== "ul") {
          closeList();
          html.push("<ul>");
          inList = "ul";
        }
        html.push(`<li>${inline(ul[1])}</li>`);
        i += 1;
        continue;
      }

      const ol = line.match(/^\d+\.\s+(.+)$/);
      if (ol) {
        if (inList !== "ol") {
          closeList();
          html.push("<ol>");
          inList = "ol";
        }
        html.push(`<li>${inline(ol[1])}</li>`);
        i += 1;
        continue;
      }

      if (!line.trim()) {
        closeList();
        i += 1;
        continue;
      }

      closeList();
      html.push(`<p>${inline(line)}</p>`);
      i += 1;
    }

    closeList();
    flushTable();
    return { html: html.join("\n"), toc };
  };

  const statusEl = document.querySelector("[data-guide-status]");
  const bodyEl = document.querySelector("[data-guide-body]");
  const tocEl = document.querySelector("[data-guide-toc]");
  const bibleView = document.querySelector("[data-bible-view]");

  let guideLoaded = false;
  let tocWired = false;

  const bibleHashes = new Set(["1", "bible"]);

  const isBibleRoute = () => {
    const h = (location.hash || "").slice(1);
    if (bibleHashes.has(h)) return true;
    if (!h) return false;
    const el = document.getElementById(h);
    return !!(el && bibleView && bibleView.contains(el));
  };

  const setBibleOpen = (open) => {
    document.body.classList.toggle("is-bible-open", open);
    if (!bibleView) return;
    if (open) bibleView.removeAttribute("hidden");
    else bibleView.setAttribute("hidden", "");
  };

  const setStatus = (msg, state) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    if (state) statusEl.dataset.state = state;
    else delete statusEl.dataset.state;
  };

  const selectCode = (code) => {
    const range = document.createRange();
    range.selectNodeContents(code);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    code.closest("pre")?.focus({ preventScroll: true });
  };

  const wireCopyButtons = () => {
    document.querySelectorAll(".code-block").forEach((block) => {
      const btn = block.querySelector(".code-copy");
      const code = block.querySelector("code");
      if (!btn || !code || btn.dataset.wired) return;
      btn.dataset.wired = "1";

      // Select-only: avoids uBlock ClickFix false positives on shell/prompt blocks.
      // User presses Ctrl+C (or Cmd+C) after click.
      btn.addEventListener("click", () => {
        selectCode(code);
        btn.classList.add("is-copied");
        btn.setAttribute("aria-label", "Selected — press Ctrl+C to copy");
        btn.setAttribute("title", "Selected — Ctrl+C");
        window.setTimeout(() => {
          btn.classList.remove("is-copied");
          btn.setAttribute("aria-label", "Select code to copy");
          btn.setAttribute("title", "Select");
        }, 2200);
      });
    });
  };

  const wireTocActive = () => {
    if (tocWired) return;
    const links = [...document.querySelectorAll("[data-guide-toc] a")];
    const heads = links
      .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
      .filter(Boolean);
    if (!heads.length) return;
    tocWired = true;

    const onScroll = () => {
      if (!document.body.classList.contains("is-bible-open")) return;
      let current = heads[0];
      for (const h of heads) {
        if (h.getBoundingClientRect().top <= 96) current = h;
      }
      links.forEach((a) => {
        a.classList.toggle("is-active", a.getAttribute("href") === `#${current.id}`);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };

  const loadGuide = () => {
    if (guideLoaded || !bodyEl) return;
    guideLoaded = true;

    fetch("VIBE-CODING-BIBLE.md", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((md) => {
        const { html, toc } = renderMarkdown(md);
        bodyEl.innerHTML = html;
        if (tocEl) {
          tocEl.innerHTML = toc
            .map((t) => `<li><a href="#${t.id}">${escapeHtml(t.text)}</a></li>`)
            .join("");
        }
        setStatus("");
        wireCopyButtons();
        wireTocActive();
      })
      .catch(() => {
        guideLoaded = false;
        setStatus(
          "Could not load the guide file. Open this page over a local server (or GitHub Pages), not as a raw file:// path.",
          "error"
        );
        bodyEl.innerHTML =
          '<p>Source file: <a href="VIBE-CODING-BIBLE.md">VIBE-CODING-BIBLE.md</a></p>';
      });
  };

  const syncRoute = () => {
    const open = isBibleRoute();
    setBibleOpen(open);
    if (open) loadGuide();
  };

  window.addEventListener("hashchange", syncRoute);
  syncRoute();
})();
