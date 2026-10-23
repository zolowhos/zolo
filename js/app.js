const tracks = [
  "assets/audios/lungskull x universe - guns [prod cyberia].mp3",
  "assets/audios/lungskull - boss shit prod lungskull.mp3",
  "assets/audios/demon.mp3",
  "assets/audios/lungskull - rich af prod lungskull.mp3"
];

for (let i = tracks.length - 1; i > 0; i -= 1) {
  const j = Math.floor(Math.random() * (i + 1));
  [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
}

const discordPfp = document.getElementById("discordPfp");

async function loadDiscordPfp() {
  const id = "1282028358024298546";
  try {
    const response = await fetch(`https://japi.rest/discord/v1/user/${id}`);
    if (!response.ok) return;
    const payload = await response.json();
    const avatar = payload.data && payload.data.avatar;
    if (!avatar) return;
    const ext = avatar.startsWith("a_") ? "gif" : "png";
    discordPfp.src = `https://cdn.discordapp.com/avatars/${id}/${avatar}.${ext}?size=256`;
  } catch {
    /* keep the saved photo */
  }
}

loadDiscordPfp();

const sections = [...document.querySelectorAll(".screen")];
const dots = [...document.querySelectorAll(".dot")];
const hint = document.getElementById("scrollHint");
const player = document.getElementById("player");
const sound = document.getElementById("sound");
const nowPlaying = document.getElementById("nowPlaying");

let trackIndex = 0;

function setActive(id) {
  dots.forEach((dot) => dot.classList.toggle("active", dot.dataset.dot === id));
  hint.classList.toggle("hidden", id !== "home");
}

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActive(visible.target.id);
}, { threshold: [0.55, 0.75] });

sections.forEach((section) => observer.observe(section));

const wallClock = document.getElementById("wallClock");
const hoursBox = wallClock.querySelector(".hours");
const minutesBox = wallClock.querySelector(".minutes");
const secondsBox = wallClock.querySelector(".seconds");
let lastStamp = new Date(0);
lastStamp.setHours(-1);

function rollDigit(element, number) {
  const next = element.lastElementChild.cloneNode(true);
  next.textContent = number;
  element.appendChild(next);
  element.classList.add("move");
  window.setTimeout(() => element.classList.remove("move"), 590);
  window.setTimeout(() => element.removeChild(element.firstElementChild), 590);
}

function rollPair(container, value) {
  const digits = value.padStart(2, "0").split("");
  const [tens, ones] = container.children;
  if (tens.lastElementChild.textContent !== digits[0]) rollDigit(tens, digits[0]);
  if (ones.lastElementChild.textContent !== digits[1]) rollDigit(ones, digits[1]);
}

function renderClock() {
  const now = new Date();
  if (lastStamp.getHours() !== now.getHours()) rollPair(hoursBox, String(now.getHours()));
  if (lastStamp.getMinutes() !== now.getMinutes()) rollPair(minutesBox, String(now.getMinutes()));
  if (lastStamp.getSeconds() !== now.getSeconds()) rollPair(secondsBox, String(now.getSeconds()));
  lastStamp = now;

  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const date = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
  const zone = new Intl.DateTimeFormat("en-US", { timeZoneName: "shortOffset" })
    .formatToParts(now)
    .find((part) => part.type === "timeZoneName")?.value || "Local";
  const label = `${date} · ${zone}`;
  document.getElementById("when").textContent = label;
  wallClock.setAttribute("aria-label", `${h}:${m}:${s}, ${label}`);
}

renderClock();
setInterval(renderClock, 100);

function trackTitle(index) {
  const file = tracks[index % tracks.length].split("/").pop();
  return decodeURIComponent(file).replace(/\.mp3$/i, "");
}

function loadTrack(index) {
  trackIndex = index % tracks.length;
  const next = new URL(encodeURI(tracks[trackIndex]), document.baseURI).href;
  if (player.src !== next) player.src = next;
  nowPlaying.textContent = trackTitle(trackIndex);
}

loadTrack(0);

function markPlaying() {
  sound.dataset.on = "true";
  sound.setAttribute("aria-label", "Pause music");
}

function markStopped() {
  sound.dataset.on = "false";
  sound.setAttribute("aria-label", "Play music");
}

let userPaused = false;
let autoplayBlocked = false;

async function startPlayback() {
  if (!player.src) loadTrack(0);
  try {
    await player.play();
    autoplayBlocked = false;
    markPlaying();
    return true;
  } catch (error) {
    if (error && error.name === "NotAllowedError") autoplayBlocked = true;
    markStopped();
    return false;
  }
}

async function toggleSound() {
  if (!player.paused) {
    userPaused = true;
    player.pause();
    markStopped();
    return;
  }
  userPaused = false;
  autoplayBlocked = false;
  await startPlayback();
}

sound.addEventListener("click", toggleSound);
player.addEventListener("playing", markPlaying);

async function tryAutoplay() {
  if (userPaused) return;
  if (!player.paused) {
    markPlaying();
    return;
  }
  if (autoplayBlocked) return;
  await startPlayback();
}

tryAutoplay();
player.addEventListener("canplay", tryAutoplay);
window.addEventListener("pageshow", tryAutoplay);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") tryAutoplay();
});

let copyTimer = 0;
document.querySelectorAll(".copy").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    document.querySelectorAll(".copy.is-copied").forEach((item) => item.classList.remove("is-copied"));
    button.classList.add("is-copied");
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => button.classList.remove("is-copied"), 1400);
  });
});
player.addEventListener("ended", () => {
  loadTrack(trackIndex + 1);
  player.play();
});

const projects = [...document.querySelectorAll(".project")];

function setProjectOpen(project, open) {
  project.classList.toggle("is-open", open);
  project.querySelector(".project-toggle").setAttribute("aria-expanded", String(open));
}

projects.forEach((project) => {
  project.querySelector(".project-toggle").addEventListener("click", () => {
    const willOpen = !project.classList.contains("is-open");
    projects.forEach((other) => setProjectOpen(other, false));
    if (willOpen) setProjectOpen(project, true);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  projects.forEach((project) => setProjectOpen(project, false));
});

const damascusCanvas = document.getElementById("damascus");
const gl = damascusCanvas.getContext("webgl", {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  powerPreference: "low-power"
});

if (!gl) {
  document.documentElement.classList.add("no-gl");
} else {
  const vertSrc = `
    attribute vec2 a;
    void main() { gl_Position = vec4(a, 0.0, 1.0); }
  `;
  const fragSrc = `
    precision mediump float;
    uniform vec2 uRes;
    uniform float uDpr;
    uniform float uScroll;
    uniform float uVh;
    uniform float uTime;

    vec3 ramp(float t) {
      vec3 c0 = vec3(0.02745);
      vec3 c1 = vec3(0.13333);
      vec3 c2 = vec3(0.22745);
      vec3 c3 = vec3(0.38039);
      if (t < 0.42) return mix(c0, c1, t / 0.42);
      if (t < 0.72) return mix(c1, c2, (t - 0.42) / 0.30);
      return mix(c2, c3, clamp((t - 0.72) / 0.28, 0.0, 1.0));
    }

    vec3 ground(float y) {
      if (y < uVh) return vec3(0.02745);
      return ramp(clamp((y - uVh) / (uVh * 2.0), 0.0, 1.0));
    }

    mat2 rot(float a) {
      float c = cos(a);
      float s = sin(a);
      return mat2(c, -s, s, c);
    }

    float damascus(vec2 p, float t) {
      float fold = 0.0;
      p *= 1.15;
      for (int i = 0; i < 5; i++) {
        p = rot(0.55 + t * 0.04) * p;
        p += vec2(
          sin(p.y * 1.65 + t + float(i) * 0.7),
          cos(p.x * 1.25 - t * 0.85)
        ) * 0.48;
        fold += sin(p.x * 2.2 + float(i) * 1.3);
        p *= 1.32;
      }
      return fold;
    }

    void main() {
      float x = gl_FragCoord.x / uDpr;
      float y = (uRes.y - gl_FragCoord.y) / uDpr + uScroll;
      float fold = damascus(vec2(x, y) * 0.0054, uTime);
      float wave = sin(fold * 1.55);
      float grain = cos(fold * 3.1 + uTime);
      vec3 color = ground(y + wave * 12.0 + grain * 3.0);
      float line = smoothstep(0.55, 0.98, wave);
      color += line * 0.012 + wave * 0.004 + grain * 0.002;
      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vert = compile(gl.VERTEX_SHADER, vertSrc);
  const frag = compile(gl.FRAGMENT_SHADER, fragSrc);
  const program = vert && frag ? gl.createProgram() : null;
  if (program) {
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
  }

  if (!program || !gl.getProgramParameter(program, gl.LINK_STATUS)) {
    document.documentElement.classList.add("no-gl");
    damascusCanvas.remove();
  } else {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uDpr = gl.getUniformLocation(program, "uDpr");
    const uScroll = gl.getUniformLocation(program, "uScroll");
    const uVh = gl.getUniformLocation(program, "uVh");
    const uTime = gl.getUniformLocation(program, "uTime");
    const band = document.createElement("div");
    band.style.cssText = "position:absolute;width:0;height:100svh;pointer-events:none;visibility:hidden";
    document.body.appendChild(band);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(damascusCanvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(damascusCanvas.clientHeight * dpr));
      if (damascusCanvas.width !== w || damascusCanvas.height !== h) {
        damascusCanvas.width = w;
        damascusCanvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function frame(now) {
      resize();
      const vh = band.getBoundingClientRect().height || window.innerHeight;
      gl.uniform2f(uRes, damascusCanvas.width, damascusCanvas.height);
      gl.uniform1f(uDpr, dpr);
      gl.uniform1f(uScroll, window.scrollY || document.documentElement.scrollTop || 0);
      gl.uniform1f(uVh, vh);
      gl.uniform1f(uTime, reduced ? 0 : now * 0.00009);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
  }
}
