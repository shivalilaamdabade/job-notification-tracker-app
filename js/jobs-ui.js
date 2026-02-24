/**
 * Job Notification Tracker — Jobs UI: filtering, cards, modal, saved
 */

import { JOBS } from './jobs-data.js';
import { getPreferences, hasPreferencesSet } from './preferences.js';
import { computeMatchScore, getMatchScoreBadgeClass } from './match-score.js';

const SAVED_IDS_KEY = 'job-tracker-saved-ids';

export function getSavedIds() {
  try {
    const saved = localStorage.getItem(SAVED_IDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveJobId(id) {
  const ids = getSavedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(SAVED_IDS_KEY, JSON.stringify(ids));
  }
}

export function removeSavedJobId(id) {
  const ids = getSavedIds().filter((x) => x !== id);
  localStorage.setItem(SAVED_IDS_KEY, JSON.stringify(ids));
}

export function isJobSaved(id) {
  return getSavedIds().includes(id);
}

function getUniqueValues(jobs, key) {
  const set = new Set(jobs.map((j) => j[key]).filter(Boolean));
  return [...set].sort();
}

function filterJobs(jobs, filters) {
  return jobs.filter((job) => {
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const match =
        job.title.toLowerCase().includes(kw) ||
        job.company.toLowerCase().includes(kw);
      if (!match) return false;
    }
    if (filters.location && job.location !== filters.location) return false;
    if (filters.mode && job.mode !== filters.mode) return false;
    if (filters.experience && job.experience !== filters.experience)
      return false;
    if (filters.source && job.source !== filters.source) return false;
    return true;
  });
}

function extractSalaryValue(salaryRange) {
  if (!salaryRange) return 0;
  const str = String(salaryRange);
  const lpaMatch = str.match(/(\d+)\s*[–-]\s*(\d+)\s*LPA/i);
  if (lpaMatch) return (parseInt(lpaMatch[1], 10) + parseInt(lpaMatch[2], 10)) / 2;
  const numMatch = str.match(/(\d+)/);
  return numMatch ? parseInt(numMatch[1], 10) : 0;
}

function sortJobs(jobs, sortBy, scoredJobs) {
  const copy = [...jobs];
  if (sortBy === 'Latest') {
    copy.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
  } else if (sortBy === 'Oldest') {
    copy.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
  } else if (sortBy === 'Match Score') {
    const scoreMap = new Map(scoredJobs.map((j) => [j.id, j.matchScore]));
    copy.sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0));
  } else if (sortBy === 'Salary') {
    copy.sort((a, b) => extractSalaryValue(b.salaryRange) - extractSalaryValue(a.salaryRange));
  } else if (sortBy === 'Company A-Z') {
    copy.sort((a, b) => a.company.localeCompare(b.company));
  } else if (sortBy === 'Company Z-A') {
    copy.sort((a, b) => b.company.localeCompare(a.company));
  }
  return copy;
}

export function getFilteredJobs(jobs, filters, sortBy = 'Latest', options = {}) {
  const { showOnlyMatches = false } = options;
  const prefs = getPreferences();
  let filtered = filterJobs(jobs, filters);
  const scoredJobs = filtered.map((job) => ({
    ...job,
    matchScore: computeMatchScore(job, prefs)
  }));
  if (showOnlyMatches) {
    const threshold = prefs.minMatchScore ?? 40;
    filtered = scoredJobs.filter((j) => j.matchScore >= threshold);
  } else {
    filtered = scoredJobs;
  }
  return sortJobs(filtered, sortBy, filtered);
}

export { hasPreferencesSet };

export function getFilterOptions(jobs) {
  return {
    locations: getUniqueValues(jobs, 'location'),
    modes: getUniqueValues(jobs, 'mode'),
    experiences: getUniqueValues(jobs, 'experience'),
    sources: getUniqueValues(jobs, 'source'),
  };
}

function formatPosted(days) {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function renderJobCard(job, options = {}) {
  const { showSave = true, showRemove = false, matchScore } = options;
  const isSaved = isJobSaved(job.id);
  const saveLabel = isSaved ? 'Saved' : 'Save';
  const saveClass = isSaved ? 'btn--secondary btn--saved' : 'btn--secondary';
  const removeBtn = showRemove
    ? `<button type="button" class="btn btn--secondary btn--sm job-btn-remove" data-job-id="${job.id}">Remove</button>`
    : '';
  const saveBtn = showSave
    ? `<button type="button" class="btn btn--sm ${saveClass} job-btn-save" data-job-id="${job.id}">${saveLabel}</button>`
    : '';
  const matchBadge =
    matchScore != null
      ? `<span class="job-card__match-badge ${getMatchScoreBadgeClass(matchScore)}">${matchScore}</span>`
      : '';
  return `
    <article class="job-card" data-job-id="${job.id}">
      <div class="job-card__header">
        <h3 class="job-card__title">${escapeHtml(job.title)}</h3>
        <div class="job-card__badges">
          ${matchBadge}
          <span class="job-card__source">${escapeHtml(job.source)}</span>
        </div>
      </div>
      <p class="job-card__company">${escapeHtml(job.company)}</p>
      <div class="job-card__meta">
        <span class="job-card__meta-item">${escapeHtml(job.location)}</span>
        <span class="job-card__meta-item">•</span>
        <span class="job-card__meta-item">${escapeHtml(job.mode)}</span>
        <span class="job-card__meta-item">•</span>
        <span class="job-card__meta-item">${escapeHtml(job.experience)}</span>
      </div>
      <p class="job-card__salary">${escapeHtml(job.salaryRange)}</p>
      <p class="job-card__posted">${formatPosted(job.postedDaysAgo)}</p>
      <div class="job-card__actions">
        <button type="button" class="btn btn--secondary btn--sm job-btn-view" data-job-id="${job.id}">View</button>
        ${saveBtn}
        ${removeBtn}
        <a href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noopener" class="btn btn--primary btn--sm">Apply</a>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function renderFilterBar(options, currentFilters, currentSort, showOnlyMatches = false) {
  const { locations, modes, experiences, sources } = options;
  const locOpts = locations
    .map((l) => `<option value="${escapeHtml(l)}" ${currentFilters.location === l ? 'selected' : ''}>${escapeHtml(l)}</option>`)
    .join('');
  const modeOpts = modes
    .map((m) => `<option value="${escapeHtml(m)}" ${currentFilters.mode === m ? 'selected' : ''}>${escapeHtml(m)}</option>`)
    .join('');
  const expOpts = experiences
    .map((e) => `<option value="${escapeHtml(e)}" ${currentFilters.experience === e ? 'selected' : ''}>${escapeHtml(e)}</option>`)
    .join('');
  const srcOpts = sources
    .map((s) => `<option value="${escapeHtml(s)}" ${currentFilters.source === s ? 'selected' : ''}>${escapeHtml(s)}</option>`)
    .join('');

  return `
    <div class="filter-toggle">
      <input type="checkbox" id="show-only-matches" class="filter-toggle__input" ${showOnlyMatches ? 'checked' : ''}>
      <label for="show-only-matches" class="filter-toggle__label">Show only jobs above my threshold</label>
    </div>
    <div class="filter-bar" id="filter-bar">
      <div class="filter-bar__group filter-bar__group--search">
        <label class="filter-bar__label" for="filter-keyword">Search</label>
        <input type="text" id="filter-keyword" class="input" placeholder="Title or company" value="${escapeHtml(currentFilters.keyword || '')}">
      </div>
      <div class="filter-bar__group">
        <label class="filter-bar__label" for="filter-location">Location</label>
        <select id="filter-location" class="select">
          <option value="">All</option>${locOpts}
        </select>
      </div>
      <div class="filter-bar__group">
        <label class="filter-bar__label" for="filter-mode">Mode</label>
        <select id="filter-mode" class="select">
          <option value="">All</option>${modeOpts}
        </select>
      </div>
      <div class="filter-bar__group">
        <label class="filter-bar__label" for="filter-experience">Experience</label>
        <select id="filter-experience" class="select">
          <option value="">All</option>${expOpts}
        </select>
      </div>
      <div class="filter-bar__group">
        <label class="filter-bar__label" for="filter-source">Source</label>
        <select id="filter-source" class="select">
          <option value="">All</option>${srcOpts}
        </select>
      </div>
      <div class="filter-bar__group">
        <label class="filter-bar__label" for="filter-sort">Sort</label>
        <select id="filter-sort" class="select">
          <option value="Latest" ${currentSort === 'Latest' ? 'selected' : ''}>Latest</option>
          <option value="Match Score" ${currentSort === 'Match Score' ? 'selected' : ''}>Match Score</option>
          <option value="Salary" ${currentSort === 'Salary' ? 'selected' : ''}>Salary</option>
          <option value="Oldest" ${currentSort === 'Oldest' ? 'selected' : ''}>Oldest</option>
          <option value="Company A-Z" ${currentSort === 'Company A-Z' ? 'selected' : ''}>Company A-Z</option>
          <option value="Company Z-A" ${currentSort === 'Company Z-A' ? 'selected' : ''}>Company Z-A</option>
        </select>
      </div>
    </div>
  `;
}

const NO_MATCHES_MESSAGE = 'No roles match your criteria. Adjust filters or lower threshold.';

export function renderJobsList(jobs, options = {}) {
  const { showSave = true, showRemove = false, noMatchesMessage = NO_MATCHES_MESSAGE } =
    typeof options === 'boolean' ? { showSave: options } : options;
  const content =
    jobs.length === 0
      ? `
      <div class="no-results">
        <p class="no-results__message">${escapeHtml(noMatchesMessage)}</p>
      </div>
    `
      : `
    <div class="jobs-grid">
      ${jobs
        .map((j) =>
          renderJobCard(j, {
            showSave,
            showRemove,
            matchScore: j.matchScore
          })
        )
        .join('')}
    </div>
  `;
  return `<div id="jobs-container">${content}</div>`;
}

export function renderJobModal(job) {
  if (!job) return '';
  const skills = job.skills
    .map((s) => `<span class="modal__skill-tag">${escapeHtml(s)}</span>`)
    .join('');
  return `
    <div class="modal-overlay" id="job-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title" id="modal-title">${escapeHtml(job.title)}</h2>
          <button type="button" class="modal__close" aria-label="Close" id="modal-close">&times;</button>
        </div>
        <p class="modal__company">${escapeHtml(job.company)}</p>
        <p class="modal__description">${escapeHtml(job.description)}</p>
        <div class="modal__skills">${skills}</div>
      </div>
    </div>
  `;
}

export function getJobById(id) {
  return JOBS.find((j) => j.id === id);
}

export function getJobsByIds(ids) {
  const set = new Set(ids);
  return JOBS.filter((j) => set.has(j.id));
}

export { JOBS };

function getCurrentFilters() {
  const keyword = document.getElementById('filter-keyword')?.value?.trim() || '';
  const location = document.getElementById('filter-location')?.value || '';
  const mode = document.getElementById('filter-mode')?.value || '';
  const experience = document.getElementById('filter-experience')?.value || '';
  const source = document.getElementById('filter-source')?.value || '';
  return { keyword, location, mode, experience, source };
}

function getCurrentSort() {
  return document.getElementById('filter-sort')?.value || 'Latest';
}

function getShowOnlyMatches() {
  return document.getElementById('show-only-matches')?.checked ?? false;
}

function applyFiltersAndRender() {
  const filters = getCurrentFilters();
  const sort = getCurrentSort();
  const showOnlyMatches = getShowOnlyMatches();
  const filtered = getFilteredJobs(JOBS, filters, sort, { showOnlyMatches });
  const container = document.getElementById('jobs-container');
  if (container) {
    container.outerHTML = renderJobsList(filtered, { showSave: true });
  }
}

function openModal(job) {
  const existing = document.getElementById('job-modal');
  if (existing) existing.remove();
  const modalHtml = renderJobModal(job);
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = document.getElementById('job-modal');
  modal.setAttribute('aria-hidden', 'false');
  const closeBtn = document.getElementById('modal-close');
  closeBtn?.focus();

  modalEscapeHandler = (e) => {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', modalEscapeHandler);
}

let modalEscapeHandler = null;

function closeModal() {
  if (modalEscapeHandler) {
    document.removeEventListener('keydown', modalEscapeHandler);
    modalEscapeHandler = null;
  }
  const modal = document.getElementById('job-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    modal.remove();
  }
}

export function setupDashboard() {
  const keywordEl = document.getElementById('filter-keyword');
  const locationEl = document.getElementById('filter-location');
  const modeEl = document.getElementById('filter-mode');
  const experienceEl = document.getElementById('filter-experience');
  const sourceEl = document.getElementById('filter-source');
  const sortEl = document.getElementById('filter-sort');
  const showOnlyMatchesEl = document.getElementById('show-only-matches');

  const handleFilterChange = () => applyFiltersAndRender();
  keywordEl?.addEventListener('input', handleFilterChange);
  locationEl?.addEventListener('change', handleFilterChange);
  modeEl?.addEventListener('change', handleFilterChange);
  experienceEl?.addEventListener('change', handleFilterChange);
  sourceEl?.addEventListener('change', handleFilterChange);
  sortEl?.addEventListener('change', handleFilterChange);
  showOnlyMatchesEl?.addEventListener('change', handleFilterChange);
}

export function setupSaved() {
  // Saved page does not need filter setup - it shows saved jobs only
}

export function setupJobsEventDelegation(onSavedUpdate) {
  document.body.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.job-btn-view');
    if (viewBtn) {
      const id = viewBtn.dataset.jobId;
      const job = getJobById(id);
      if (job) openModal(job);
      return;
    }

    const saveBtn = e.target.closest('.job-btn-save');
    if (saveBtn) {
      const id = saveBtn.dataset.jobId;
      if (isJobSaved(id)) {
        removeSavedJobId(id);
        saveBtn.textContent = 'Save';
        saveBtn.classList.remove('btn--saved');
      } else {
        saveJobId(id);
        saveBtn.textContent = 'Saved';
        saveBtn.classList.add('btn--saved');
      }
      onSavedUpdate?.();
      return;
    }

    const removeBtn = e.target.closest('.job-btn-remove');
    if (removeBtn) {
      removeSavedJobId(removeBtn.dataset.jobId);
      onSavedUpdate?.();
      return;
    }

    if (e.target.id === 'modal-close' || e.target.classList?.contains('modal-overlay')) {
      closeModal();
      return;
    }
  });
}
