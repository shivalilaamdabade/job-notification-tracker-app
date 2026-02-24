/**
 * Job Notification Tracker — Match Score Engine
 * Deterministic scoring per specification.
 */

/**
 * Compute match score for a job against user preferences.
 * Rules (exact per spec):
 * +25 if any roleKeyword appears in job.title (case-insensitive)
 * +15 if any roleKeyword appears in job.description
 * +15 if job.location matches preferredLocations
 * +10 if job.mode matches preferredMode
 * +10 if job.experience matches experienceLevel
 * +15 if overlap between job.skills and user.skills (any match)
 * +5 if postedDaysAgo <= 2
 * +5 if source is LinkedIn
 * Cap at 100.
 */
export function computeMatchScore(job, prefs) {
  let score = 0;

  const roleKeywords = prefs.roleKeywords || [];
  const titleLower = (job.title || '').toLowerCase();
  const descLower = (job.description || '').toLowerCase();

  if (roleKeywords.length > 0) {
    for (const kw of roleKeywords) {
      const k = kw.trim().toLowerCase();
      if (!k) continue;
      if (titleLower.includes(k)) {
        score += 25;
        break;
      }
    }
  }

  if (roleKeywords.length > 0) {
    for (const kw of roleKeywords) {
      const k = kw.trim().toLowerCase();
      if (!k) continue;
      if (descLower.includes(k)) {
        score += 15;
        break;
      }
    }
  }

  const preferredLocations = prefs.preferredLocations || [];
  if (preferredLocations.length > 0 && job.location) {
    if (preferredLocations.includes(job.location)) {
      score += 15;
    }
  }

  const preferredMode = prefs.preferredMode || [];
  if (preferredMode.length > 0 && job.mode) {
    if (preferredMode.includes(job.mode)) {
      score += 10;
    }
  }

  if (prefs.experienceLevel && job.experience) {
    if (prefs.experienceLevel === job.experience) {
      score += 10;
    }
  }

  const userSkills = (prefs.skills || []).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const jobSkills = (job.skills || []).map((s) => String(s).toLowerCase());
  if (userSkills.length > 0 && jobSkills.length > 0) {
    const hasOverlap = userSkills.some((us) => jobSkills.some((js) => js === us || js.includes(us)));
    if (hasOverlap) score += 15;
  }

  if (job.postedDaysAgo != null && job.postedDaysAgo <= 2) {
    score += 5;
  }

  if (job.source === 'LinkedIn') {
    score += 5;
  }

  return Math.min(100, score);
}

export function getMatchScoreBadgeClass(score) {
  if (score >= 80) return 'match-badge--high';
  if (score >= 60) return 'match-badge--medium';
  if (score >= 40) return 'match-badge--neutral';
  return 'match-badge--low';
}
