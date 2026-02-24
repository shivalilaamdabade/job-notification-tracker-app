/**
 * Job Notification Tracker — Preferences (localStorage)
 */

const PREFERENCES_KEY = 'jobTrackerPreferences';

const DEFAULT_PREFERENCES = {
  roleKeywords: [],
  preferredLocations: [],
  preferredMode: [],
  experienceLevel: '',
  skills: [],
  minMatchScore: 40
};

export function getPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw);
    return {
      roleKeywords: Array.isArray(parsed.roleKeywords) ? parsed.roleKeywords : DEFAULT_PREFERENCES.roleKeywords,
      preferredLocations: Array.isArray(parsed.preferredLocations) ? parsed.preferredLocations : DEFAULT_PREFERENCES.preferredLocations,
      preferredMode: Array.isArray(parsed.preferredMode) ? parsed.preferredMode : DEFAULT_PREFERENCES.preferredMode,
      experienceLevel: typeof parsed.experienceLevel === 'string' ? parsed.experienceLevel : DEFAULT_PREFERENCES.experienceLevel,
      skills: Array.isArray(parsed.skills) ? parsed.skills : DEFAULT_PREFERENCES.skills,
      minMatchScore: typeof parsed.minMatchScore === 'number' ? Math.min(100, Math.max(0, parsed.minMatchScore)) : DEFAULT_PREFERENCES.minMatchScore
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs) {
  const sanitized = {
    roleKeywords: Array.isArray(prefs.roleKeywords) ? prefs.roleKeywords : [],
    preferredLocations: Array.isArray(prefs.preferredLocations) ? prefs.preferredLocations : [],
    preferredMode: Array.isArray(prefs.preferredMode) ? prefs.preferredMode : [],
    experienceLevel: typeof prefs.experienceLevel === 'string' ? prefs.experienceLevel : '',
    skills: Array.isArray(prefs.skills) ? prefs.skills : [],
    minMatchScore: typeof prefs.minMatchScore === 'number' ? Math.min(100, Math.max(0, prefs.minMatchScore)) : 40
  };
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(sanitized));
}

export function hasPreferencesSet() {
  const p = getPreferences();
  return (
    p.roleKeywords.length > 0 ||
    p.preferredLocations.length > 0 ||
    p.preferredMode.length > 0 ||
    p.experienceLevel !== '' ||
    p.skills.length > 0
  );
}
