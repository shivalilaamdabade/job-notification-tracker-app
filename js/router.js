/**
 * Job Notification Tracker — Client-side Router
 * History API. No full page reloads.
 */

import {
  JOBS,
  getFilteredJobs,
  getFilterOptions,
  renderFilterBar,
  renderJobsList,
  getJobsByIds,
  getSavedIds,
  hasPreferencesSet,
  setupDashboard,
  setupSaved,
  setupJobsEventDelegation,
} from './jobs-ui.js';
import { getPreferences, savePreferences } from './preferences.js';

const ROUTES = {
  '/': { title: 'Home', pageTitle: 'Home' },
  '/dashboard': { title: 'Dashboard', pageTitle: 'Dashboard' },
  '/saved': { title: 'Saved', pageTitle: 'Saved' },
  '/digest': { title: 'Digest', pageTitle: 'Digest' },
  '/settings': { title: 'Settings', pageTitle: 'Settings' },
  '/proof': { title: 'Proof', pageTitle: 'Proof' }
};

const NOT_FOUND_TITLE = 'Page Not Found';
const NOT_FOUND_SUBTEXT = 'The page you are looking for does not exist.';

function getPath() {
  return window.location.pathname || '/';
}

function getRoute(path) {
  return ROUTES[path] || null;
}

function renderLanding() {
  return `
    <main class="route-page route-page--landing" id="route-content">
      <div class="route-page__content">
        <h1 class="landing-headline">Stop Missing The Right Jobs.</h1>
        <p class="route-page__subtext landing-subtext">Precision-matched job discovery delivered daily at 9AM.</p>
        <a href="/settings" class="btn btn--primary landing-cta">Start Tracking</a>
      </div>
    </main>
  `;
}

function renderSettings() {
  const prefs = getPreferences();
  const roleKeywordsVal = (prefs.roleKeywords || []).join(', ');
  const locationsOpts = [
    'Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune', 'Delhi NCR', 'Noida', 'Gurgaon', 'Remote'
  ];
  const locOptions = locationsOpts
    .map((loc) => {
      const selected = (prefs.preferredLocations || []).includes(loc) ? ' selected' : '';
      return `<option value="${loc}"${selected}>${loc}</option>`;
    })
    .join('');
  const modeRemote = (prefs.preferredMode || []).includes('Remote') ? ' checked' : '';
  const modeHybrid = (prefs.preferredMode || []).includes('Hybrid') ? ' checked' : '';
  const modeOnsite = (prefs.preferredMode || []).includes('Onsite') ? ' checked' : '';
  const expLevels = ['', 'Fresher', '0-1', '1-3', '3-5'];
  const expOptions = expLevels
    .map((e) => {
      const val = e || '';
      const label = e || 'Select level';
      const selected = prefs.experienceLevel === e ? ' selected' : '';
      return `<option value="${val}"${selected}>${label}</option>`;
    })
    .join('');
  const skillsVal = (prefs.skills || []).join(', ');
  const minScore = prefs.minMatchScore ?? 40;
  return `
    <main class="route-page route-page--form" id="route-content">
      <div class="route-page__content">
        <h1>Settings</h1>
        <p class="route-page__subtext">Configure your job preferences. Saved to this device.</p>
        <form class="settings-form" id="settings-form">
          <div class="form-group">
            <label class="form-group__label" for="role-keywords">Role keywords</label>
            <input type="text" id="role-keywords" class="input" placeholder="e.g. Software Engineer, Intern" value="${escapeAttr(roleKeywordsVal)}">
          </div>
          <div class="form-group">
            <label class="form-group__label" for="preferred-locations">Preferred locations</label>
            <select id="preferred-locations" class="select" multiple size="4">
              ${locOptions}
            </select>
            <span class="form-group__hint">Hold Ctrl/Cmd to select multiple</span>
          </div>
          <div class="form-group">
            <label class="form-group__label">Preferred mode</label>
            <div class="checkbox-group">
              <label class="checkbox-label"><input type="checkbox" name="mode" value="Remote"${modeRemote}> Remote</label>
              <label class="checkbox-label"><input type="checkbox" name="mode" value="Hybrid"${modeHybrid}> Hybrid</label>
              <label class="checkbox-label"><input type="checkbox" name="mode" value="Onsite"${modeOnsite}> Onsite</label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-group__label" for="experience-level">Experience level</label>
            <select id="experience-level" class="select">
              ${expOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-group__label" for="skills">Skills</label>
            <input type="text" id="skills" class="input" placeholder="e.g. React, Python, Java" value="${escapeAttr(skillsVal)}">
          </div>
          <div class="form-group">
            <label class="form-group__label" for="min-match-score">Minimum match threshold: <span id="min-score-value">${minScore}</span></label>
            <input type="range" id="min-match-score" class="range-input" min="0" max="100" value="${minScore}">
          </div>
          <button type="submit" class="btn btn--primary">Save preferences</button>
        </form>
      </div>
    </main>
  `;
}
function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderDashboard() {
  const filters = {};
  const sort = 'Latest';
  const showOnlyMatches = false;
  const filtered = getFilteredJobs(JOBS, filters, sort, { showOnlyMatches });
  const options = getFilterOptions(JOBS);
  const filterBar = renderFilterBar(options, filters, sort, showOnlyMatches);
  const jobsList = renderJobsList(filtered, { showSave: true });
  const prefsBanner = !hasPreferencesSet()
    ? '<div class="prefs-banner"><p class="prefs-banner__message">Set your preferences to activate intelligent matching.</p></div>'
    : '';
  return `
    <main class="route-page route-page--jobs" id="route-content">
      <div class="route-page__content">
        <h1>Dashboard</h1>
        ${prefsBanner}
        ${filterBar}
        ${jobsList}
      </div>
    </main>
  `;
}

function renderSaved() {
  const savedIds = getSavedIds();
  const savedJobs = getJobsByIds(savedIds);
  const content =
    savedJobs.length > 0
      ? renderJobsList(savedJobs, { showSave: false, showRemove: true })
      : `
    <div class="empty-state">
      <h3 class="empty-state__title">No saved jobs</h3>
      <p class="empty-state__body">Jobs you save for later will appear here.</p>
    </div>
  `;
  return `
    <main class="route-page route-page--jobs" id="route-content">
      <div class="route-page__content">
        <h1>Saved</h1>
        ${content}
      </div>
    </main>
  `;
}

function renderDigest() {
  return `
    <main class="route-page" id="route-content">
      <div class="route-page__content">
        <h1>Digest</h1>
        <div class="empty-state">
          <h3 class="empty-state__title">Daily summary</h3>
          <p class="empty-state__body">Your personalized job digest will be delivered daily at 9AM.</p>
        </div>
      </div>
    </main>
  `;
}

function renderProof() {
  return `
    <main class="route-page" id="route-content">
      <div class="route-page__content">
        <h1>Proof</h1>
        <p class="route-page__subtext">Placeholder for artifact collection.</p>
      </div>
    </main>
  `;
}

function render404() {
  return `
    <main class="route-page" id="route-content">
      <div class="route-page__content">
        <h1>${NOT_FOUND_TITLE}</h1>
        <p class="route-page__subtext">${NOT_FOUND_SUBTEXT}</p>
      </div>
    </main>
  `;
}

function renderPage(path) {
  const route = getRoute(path);
  if (!route) return render404();

  switch (path) {
    case '/': return renderLanding();
    case '/settings': return renderSettings();
    case '/dashboard': return renderDashboard();
    case '/saved': return renderSaved();
    case '/digest': return renderDigest();
    case '/proof': return renderProof();
    default: return render404();
  }
}

function updateDocumentTitle(path) {
  const route = getRoute(path);
  const baseTitle = 'Job Notification Tracker';
  document.title = route ? `${route.title} — ${baseTitle}` : `${NOT_FOUND_TITLE} — ${baseTitle}`;
}

function setupSettings() {
  const form = document.getElementById('settings-form');
  const minScoreEl = document.getElementById('min-match-score');
  const minScoreValEl = document.getElementById('min-score-value');

  minScoreEl?.addEventListener('input', () => {
    if (minScoreValEl) minScoreValEl.textContent = minScoreEl.value;
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const roleKeywordsRaw = document.getElementById('role-keywords')?.value || '';
    const roleKeywords = roleKeywordsRaw.split(',').map((s) => s.trim()).filter(Boolean);
    const locSelect = document.getElementById('preferred-locations');
    const preferredLocations = locSelect ? [...locSelect.selectedOptions].map((o) => o.value) : [];
    const modeCheckboxes = form.querySelectorAll('input[name="mode"]:checked');
    const preferredMode = [...modeCheckboxes].map((c) => c.value);
    const experienceLevel = document.getElementById('experience-level')?.value || '';
    const skillsRaw = document.getElementById('skills')?.value || '';
    const skills = skillsRaw.split(',').map((s) => s.trim()).filter(Boolean);
    const minMatchScore = parseInt(document.getElementById('min-match-score')?.value || '40', 10);
    savePreferences({
      roleKeywords,
      preferredLocations,
      preferredMode,
      experienceLevel,
      skills,
      minMatchScore: isNaN(minMatchScore) ? 40 : minMatchScore
    });
    if (minScoreValEl) minScoreValEl.textContent = document.getElementById('min-match-score')?.value || '40';
  });
}

function setActiveLink(path) {
  const links = document.querySelectorAll('.app-nav__link');
  links.forEach((link) => {
    const href = link.getAttribute('href') || '/';
    const linkPath = href === '' ? '/' : (href.startsWith('/') ? href : `/${href}`);
    const isActive = path === linkPath;
    link.classList.toggle('is-active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : null);
  });
}

function navigate(path, pushState = true) {
  const normalizedPath = path || '/';
  if (normalizedPath === getPath() && pushState) return;
  if (pushState) {
    window.history.pushState({ path: normalizedPath }, '', normalizedPath);
  }
  const content = document.getElementById('route-content');
  if (content) {
    content.outerHTML = renderPage(normalizedPath);
  }
  updateDocumentTitle(normalizedPath);
  setActiveLink(normalizedPath);
  if (normalizedPath === '/dashboard') setupDashboard();
  if (normalizedPath === '/saved') setupSaved();
  if (normalizedPath === '/settings') setupSettings();
}

function initRouter() {
  const path = getPath();
  const contentEl = document.getElementById('route-content');
  if (contentEl) {
    contentEl.outerHTML = renderPage(path);
  }
  updateDocumentTitle(path);
  setActiveLink(path);
  if (path === '/dashboard') setupDashboard();
  if (path === '/saved') setupSaved();
  if (path === '/settings') setupSettings();

  setupJobsEventDelegation(() => {
    if (getPath() === '/saved') navigate('/saved', false);
  });

  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="/"]');
    const href = link?.getAttribute('href');
    if (!link || !href || href.startsWith('//')) return;

    e.preventDefault();
    navigate(href === '' ? '/' : href);
  });

  window.addEventListener('popstate', (e) => {
    const path = e.state?.path || getPath();
    navigate(path, false);
  });
}

export { initRouter, renderPage, navigate, getPath };
