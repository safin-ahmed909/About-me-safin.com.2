/* ==========================================================================
   ADMIN PANEL — MAIN SCRIPT
   Reads/writes the same "portfolioConfig" object in localStorage that
   script.js (the live site) reads. Each card's "Save changes" button only
   updates the keys belonging to that section, so sections are independent.
   ========================================================================== */

const STORAGE_KEY = 'portfolioConfig';

const DEFAULT_CONFIG = {
  name: 'Your Name',
  about: "Write a short introduction about yourself in the Admin Panel. Tell visitors who you are, what you do, and what you're passionate about.",
  tagline: 'Designer. Developer. Creator.',
  logoText: 'Portfolio',
  videoSrc: '',
  profileImg: 'assets/images/profile-placeholder.svg',
  logoImg: 'assets/images/favicon-placeholder.svg',
  faviconImg: 'assets/images/favicon-placeholder.svg',
  social: { facebook: '', instagram: '', tiktok: '', youtube: '', github: '', discord: '' }
};

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

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** Reads a File as a base64 data URL. Resolves null if no file was chosen. */
function readFileAsDataURL(fileInput) {
  return new Promise((resolve, reject) => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

let statusTimeout;
function showStatus(message, isError = false) {
  const banner = document.getElementById('statusBanner');
  banner.textContent = message;
  banner.style.borderColor = isError ? 'var(--danger)' : 'var(--gold)';
  banner.style.color = isError ? 'var(--danger)' : 'var(--gold-bright)';
  banner.classList.add('is-visible');
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => banner.classList.remove('is-visible'), 3500);
}

/** Fills every form field from the given config, and updates previews. */
function populateForm(config) {
  document.getElementById('videoPath').value = config.videoSrc && !config.videoSrc.startsWith('data:') ? config.videoSrc : '';
  document.getElementById('nameInput').value = config.name;
  document.getElementById('taglineInput').value = config.tagline;
  document.getElementById('aboutInput').value = config.about;
  document.getElementById('logoTextInput').value = config.logoText;

  Object.keys(config.social).forEach((key) => {
    const input = document.getElementById(`social-${key}`);
    if (input) input.value = config.social[key];
  });

  if (config.videoSrc) document.getElementById('videoPreview').src = config.videoSrc;
  document.getElementById('profilePreview').src = config.profileImg;
  document.getElementById('logoPreview').src = config.logoImg;
  document.getElementById('faviconPreview').src = config.faviconImg;
}

document.addEventListener('DOMContentLoaded', () => {
  let config = loadConfig();
  populateForm(config);

  // ---------- Live preview: video upload / path ----------
  document.getElementById('videoUpload').addEventListener('change', async (e) => {
    const dataUrl = await readFileAsDataURL(e.target);
    if (dataUrl) {
      document.getElementById('videoPreview').src = dataUrl;
      document.getElementById('videoPath').value = ''; // uploaded file takes priority
    }
  });
  document.getElementById('videoPath').addEventListener('input', (e) => {
    if (e.target.value) document.getElementById('videoPreview').src = e.target.value;
  });

  // ---------- Live preview: image uploads ----------
  document.getElementById('profileUpload').addEventListener('change', async (e) => {
    const dataUrl = await readFileAsDataURL(e.target);
    if (dataUrl) document.getElementById('profilePreview').src = dataUrl;
  });
  document.getElementById('logoUpload').addEventListener('change', async (e) => {
    const dataUrl = await readFileAsDataURL(e.target);
    if (dataUrl) document.getElementById('logoPreview').src = dataUrl;
  });
  document.getElementById('faviconUpload').addEventListener('change', async (e) => {
    const dataUrl = await readFileAsDataURL(e.target);
    if (dataUrl) document.getElementById('faviconPreview').src = dataUrl;
  });

  // ---------- Save: Background Video ----------
  document.querySelector('[data-save="video"]').addEventListener('click', async () => {
    config = loadConfig();
    const path = document.getElementById('videoPath').value.trim();
    const uploadInput = document.getElementById('videoUpload');

    try {
      if (uploadInput.files.length) {
        const dataUrl = await readFileAsDataURL(uploadInput);
        config.videoSrc = dataUrl;
      } else if (path) {
        config.videoSrc = path;
      }
      saveConfig(config);
      showStatus('Background video saved.');
    } catch (err) {
      showStatus('That video file is too large to save in the browser. Use the folder path option instead.', true);
    }
  });

  // ---------- Save: Identity ----------
  document.querySelector('[data-save="identity"]').addEventListener('click', async () => {
    config = loadConfig();
    config.name = document.getElementById('nameInput').value.trim() || DEFAULT_CONFIG.name;
    config.tagline = document.getElementById('taglineInput').value.trim() || DEFAULT_CONFIG.tagline;

    const profileInput = document.getElementById('profileUpload');
    if (profileInput.files.length) {
      try {
        config.profileImg = await readFileAsDataURL(profileInput);
      } catch (err) {
        showStatus('Could not read that image file.', true);
        return;
      }
    }
    saveConfig(config);
    showStatus('Identity saved.');
  });

  // ---------- Save: About ----------
  document.querySelector('[data-save="about"]').addEventListener('click', () => {
    config = loadConfig();
    config.about = document.getElementById('aboutInput').value.trim() || DEFAULT_CONFIG.about;
    saveConfig(config);
    showStatus('About Me saved.');
  });

  // ---------- Save: Social links ----------
  document.querySelector('[data-save="social"]').addEventListener('click', () => {
    config = loadConfig();
    Object.keys(config.social).forEach((key) => {
      const input = document.getElementById(`social-${key}`);
      config.social[key] = input.value.trim();
    });
    saveConfig(config);
    showStatus('Social links saved.');
  });

  // ---------- Save: Branding (logo + favicon) ----------
  document.querySelector('[data-save="branding"]').addEventListener('click', async () => {
    config = loadConfig();
    config.logoText = document.getElementById('logoTextInput').value.trim() || DEFAULT_CONFIG.logoText;

    const logoInput = document.getElementById('logoUpload');
    const faviconInput = document.getElementById('faviconUpload');
    try {
      if (logoInput.files.length) config.logoImg = await readFileAsDataURL(logoInput);
      if (faviconInput.files.length) config.faviconImg = await readFileAsDataURL(faviconInput);
    } catch (err) {
      showStatus('Could not read one of those image files.', true);
      return;
    }
    saveConfig(config);
    showStatus('Logo & favicon saved.');
  });

  // ---------- Export settings ----------
  document.getElementById('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(loadConfig(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    showStatus('Settings exported.');
  });

  // ---------- Import settings ----------
  document.getElementById('importInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      saveConfig({ ...DEFAULT_CONFIG, ...imported, social: { ...DEFAULT_CONFIG.social, ...(imported.social || {}) } });
      config = loadConfig();
      populateForm(config);
      showStatus('Settings imported successfully.');
    } catch (err) {
      showStatus('That file could not be read as valid settings JSON.', true);
    }
  });

  // ---------- Reset to defaults ----------
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all settings back to defaults? This cannot be undone unless you have exported a backup.')) return;
    localStorage.removeItem(STORAGE_KEY);
    config = loadConfig();
    populateForm(config);
    showStatus('Settings reset to defaults.');
  });
});
