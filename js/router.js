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
  setupDashboard,
  setupSaved,
  setupJobsEventDelegation,
} from './jobs-ui.js';

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
  return `
    <main class="route-page route-page--form" id="route-content">
      <div class="route-page__content">
        <h1>Settings</h1>
        <p class="route-page__subtext">Configure your job preferences. Changes are not saved yet.</p>
        <form class="settings-form">
          <div class="form-group">
            <label class="form-group__label" for="role-keywords">Role keywords</label>
            <input type="text" id="role-keywords" class="input" placeholder="e.g. Software Engineer, Product Manager">
          </div>
          <div class="form-group">
            <label class="form-group__label" for="locations">Preferred locations</label>
            <input type="text" id="locations" class="input" placeholder="e.g. San Francisco, Remote">
          </div>
          <div class="form-group">
            <label class="form-group__label" for="mode">Mode</label>
            <select id="mode" class="select">
              <option value="">Select mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-group__label" for="experience">Experience level</label>
            <input type="text" id="experience" class="input" placeholder="e.g. Mid-level, Senior">
          </div>
        </form>
      </div>
    </main>
  `;
}

function renderDashboard() {
  const filters = {};
  const sort = 'Latest';
  const filtered = getFilteredJobs(JOBS, filters, sort);
  const options = getFilterOptions(JOBS);
  const filterBar = renderFilterBar(options, filters, sort);
  const jobsList = renderJobsList(filtered, { showSave: true });
  return `
    <main class="route-page route-page--jobs" id="route-content">
      <div class="route-page__content">
        <h1>Dashboard</h1>
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
