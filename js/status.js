/**
 * Job Notification Tracker — Job status persistence & history
 */

import { JOBS } from './jobs-data.js';

const STATUS_KEY = 'jobTrackerStatus';

export const STATUS_VALUES = ['Not Applied', 'Applied', 'Rejected', 'Selected'];

function loadStatusMap() {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveStatusMap(map) {
  try {
    localStorage.setItem(STATUS_KEY, JSON.stringify(map));
  } catch {
    // ignore write errors
  }
}

export function getJobStatus(jobId) {
  const map = loadStatusMap();
  const entry = map[jobId];
  if (!entry || !entry.status || !STATUS_VALUES.includes(entry.status)) {
    return { status: 'Not Applied', updatedAt: null };
  }
  return entry;
}

export function setJobStatus(jobId, status) {
  const normalized = STATUS_VALUES.includes(status) ? status : 'Not Applied';
  const map = loadStatusMap();
  map[jobId] = {
    status: normalized,
    updatedAt: new Date().toISOString(),
  };
  saveStatusMap(map);
}

export function getStatusMap() {
  return loadStatusMap();
}

export function getRecentStatusUpdates(limit = 10) {
  const map = loadStatusMap();
  const entries = Object.entries(map)
    .filter(([, v]) => v && v.status && v.updatedAt)
    .sort(
      (a, b) =>
        new Date(b[1].updatedAt).getTime() -
        new Date(a[1].updatedAt).getTime()
    )
    .slice(0, limit)
    .map(([jobId, v]) => {
      const job = JOBS.find((j) => j.id === jobId);
      if (!job) return null;
      return {
        jobId,
        status: v.status,
        updatedAt: v.updatedAt,
        job,
      };
    })
    .filter(Boolean);

  return entries;
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case 'Applied':
      return 'status-badge--applied';
    case 'Rejected':
      return 'status-badge--rejected';
    case 'Selected':
      return 'status-badge--selected';
    case 'Not Applied':
    default:
      return 'status-badge--neutral';
  }
}

