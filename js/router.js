/**
 * Job Notification App — Client-side Router
 * History API. No full page reloads. Active link does not reload.
 */

const ROUTES = {
  '/': { title: 'Home', pageTitle: 'Home' },
  '/dashboard': { title: 'Dashboard', pageTitle: 'Dashboard' },
  '/saved': { title: 'Saved', pageTitle: 'Saved' },
  '/digest': { title: 'Digest', pageTitle: 'Digest' },
  '/settings': { title: 'Settings', pageTitle: 'Settings' },
  '/proof': { title: 'Proof', pageTitle: 'Proof' }
};

const PLACEHOLDER_SUBTEXT = 'This section will be built in the next step.';
const NOT_FOUND_TITLE = 'Page Not Found';
const NOT_FOUND_SUBTEXT = 'The page you are looking for does not exist.';

function getPath() {
  return window.location.pathname || '/';
}

function getRoute(path) {
  return ROUTES[path] || null;
}

function renderPage(path) {
  const route = getRoute(path);
  const is404 = !route;
  const title = is404 ? NOT_FOUND_TITLE : route.pageTitle;
  const subtext = is404 ? NOT_FOUND_SUBTEXT : PLACEHOLDER_SUBTEXT;

  return `
    <main class="route-page" id="route-content">
      <div class="route-page__content">
        <h1>${title}</h1>
        <p class="route-page__subtext">${subtext}</p>
      </div>
    </main>
  `;
}

function updateDocumentTitle(path) {
  const route = getRoute(path);
  const baseTitle = 'Job Notification App';
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
}

function initRouter() {
  const path = getPath();
  const contentEl = document.getElementById('route-content');
  if (contentEl) {
    contentEl.outerHTML = renderPage(path);
  }
  updateDocumentTitle(path);
  setActiveLink(path);

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
