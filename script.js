/* ==========================================================================
   PORTFOLIO — MAIN SCRIPT
   Reads the site configuration saved by the Admin Panel (admin.html/admin.js)
   from localStorage under the key "portfolioConfig" and applies it to the
   page. If no config has been saved yet, sensible defaults are used so the
   site never looks broken on a first visit.
   ========================================================================== */

const STORAGE_KEY = 'portfolioConfig';

/* Default content — shown until the Admin Panel is used to customize it */
const DEFAULT_CONFIG = {
  name: 'Your Name',
  about: "Write a short introduction about yourself in the Admin Panel. Tell visitors who you are, what you do, and what you're passionate about.",
  tagline: 'Designer. Developer. Creator.',
  logoText: 'Portfolio',
  videoSrc: '',
  profileImg: 'assets/images/profile-placeholder.svg',
  logoImg: 'assets/images/favicon-placeholder.svg',
  faviconImg: 'assets/images/favicon-placeholder.svg',
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    github: '',
    discord: ''
  }
};

/** Reads the saved config, merging with defaults so missing keys never break the page. */
function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_CONFIG);
    const saved = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULT_CONFIG),
      ...saved,
      social: { ...DEFAULT_CONFIG.social, ...(saved.social || {}) }
    };
  } catch (err) {
    console.warn('Could not read saved settings, using defaults.', err);
    return structuredClone(DEFAULT_CONFIG);
  }
}

/** Applies a config object to every part of the page. */
function applyConfig(config) {
  // --- Name (hero + about + footer) ---
  document.getElementById('heroName').textContent = config.name;
  document.getElementById('aboutName').textContent = config.name;
  document.getElementById('footerName').textContent = config.name;
  document.title = `${config.name} — Portfolio`;

  // --- About text ---
  document.getElementById('aboutText').textContent = config.about;

  // --- Logo ---
  const logoImg = document.getElementById('siteLogo');
  const logoText = document.getElementById('siteLogoText');
  if (config.logoImg) logoImg.src = config.logoImg;
  logoText.textContent = config.logoText;

  // --- Favicon ---
  if (config.faviconImg) {
    document.getElementById('favicon').href = config.faviconImg;
  }

  // --- Profile picture ---
  if (config.profileImg) {
    document.getElementById('profileImg').src = config.profileImg;
  }

  // --- Background video ---
  const video = document.getElementById('heroVideo');
  const source = document.getElementById('heroVideoSource');
  if (config.videoSrc) {
    source.src = config.videoSrc;
    video.load();
    video.play().catch(() => {
      /* Autoplay can be blocked until user interacts with the page — that's fine. */
    });
  }

  // --- Social links ---
  // Only show icons that have a link configured; hide the rest so an empty
  // href never shows as a dead link.
  document.querySelectorAll('[data-social]').forEach((link) => {
    const key = link.dataset.social;
    const url = config.social[key];
    const li = link.closest('li');
    if (url) {
      link.href = url;
      li.style.display = '';
    } else {
      li.style.display = 'none';
    }
  });

  return config.tagline;
}

/** Simple typewriter effect for the hero tagline. Loops with a pause at each end. */
function startTypingAnimation(text) {
  const el = document.getElementById('typingText');
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.textContent = '|';

  let i = 0;
  let deleting = false;

  function tick() {
    el.textContent = text.slice(0, i);
    el.appendChild(cursor);

    if (!deleting && i < text.length) {
      i++;
      setTimeout(tick, 55);
    } else if (!deleting && i === text.length) {
      deleting = true;
      setTimeout(tick, 1800); // pause at full text
    } else if (deleting && i > 0) {
      i--;
      setTimeout(tick, 28);
    } else {
      deleting = false;
      setTimeout(tick, 500); // pause before retyping
    }
  }
  tick();
}

/** Reveals the About section as it scrolls into view. */
function setupScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  targets.forEach((t) => observer.observe(t));
}

/** Removes the loader / triggers the page fade-in once everything is ready. */
function finishLoading() {
  document.body.classList.remove('is-loading');
}

document.addEventListener('DOMContentLoaded', () => {
  const config = loadConfig();
  const tagline = applyConfig(config);

  startTypingAnimation(tagline);
  setupScrollReveal();

  document.getElementById('year').textContent = new Date().getFullYear();

  // Small delay so the loader animation is visible even on fast connections
  setTimeout(finishLoading, 400);
});

/* Keep the page in sync if settings are changed in the Admin Panel in
   another tab (storage event fires cross-tab automatically). */
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    applyConfig(loadConfig());
  }
});
