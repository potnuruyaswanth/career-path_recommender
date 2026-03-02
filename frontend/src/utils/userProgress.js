/**
 * User Progress Tracker
 * Saves user interests, viewed careers, and stream preferences to localStorage
 * No backend needed, works completely offline
 */

const STORAGE_KEY = "career_user_progress";

/**
 * Get all saved user progress from localStorage
 * Returns default structure if nothing saved yet
 */
export function getUserProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
      interests: [],
      viewedCareers: [],
      lastStream: null,
      board: null,
      lastUpdated: null
    };
  } catch (error) {
    console.error("Error reading user progress:", error);
    return {
      interests: [],
      viewedCareers: [],
      lastStream: null,
      board: null,
      lastUpdated: null
    };
  }
}

/**
 * Save or update user progress
 * Merges with existing data and updates timestamp
 */
export function saveUserProgress(updatedData) {
  try {
    const existing = getUserProgress();
    const merged = {
      ...existing,
      ...updatedData,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    console.log("✅ User progress saved:", merged);
  } catch (error) {
    console.error("Error saving user progress:", error);
  }
}

/**
 * Save interests when user completes onboarding
 */
export function saveInterests(interestsList) {
  const interests = interestsList.map(i => 
    typeof i === 'string' ? i : (i.name || i)
  );
  saveUserProgress({ interests });
}

/**
 * Save the board (CBSE/ICSE/STATE) selection
 */
export function saveBoard(boardName) {
  saveUserProgress({ board: boardName });
}

/**
 * Add a career to viewed careers list (prevent duplicates)
 */
export function addViewedCareer(careerId) {
  const progress = getUserProgress();
  const careerIdNormalized = careerId.replace('career:', '');
  
  if (!progress.viewedCareers.includes(careerIdNormalized)) {
    saveUserProgress({
      viewedCareers: [...progress.viewedCareers, careerIdNormalized]
    });
  }
}

/**
 * Save the last stream the user explored
 */
export function saveLastStream(streamId) {
  const streamIdNormalized = streamId.replace('stream:', '');
  saveUserProgress({ lastStream: streamIdNormalized });
}

/**
 * Get recently viewed careers (last N items)
 */
export function getRecentlyViewed(limit = 5) {
  const progress = getUserProgress();
  return progress.viewedCareers.slice(-limit);
}

/**
 * Check if a career has been viewed
 */
export function isCareerViewed(careerId) {
  const progress = getUserProgress();
  const careerIdNormalized = careerId.replace('career:', '');
  return progress.viewedCareers.includes(careerIdNormalized);
}

/**
 * Get suggested next action based on saved progress
 */
export function getResumeMessage() {
  const progress = getUserProgress();
  
  if (progress.lastStream) {
    return `👋 Welcome back! Continue exploring ${progress.lastStream} careers?`;
  }
  
  if (progress.interests && progress.interests.length > 0) {
    return `👋 Welcome back! Let's continue with your interests in ${progress.interests.slice(0, 2).join(', ')}`;
  }
  
  return null;
}

/**
 * Reset all saved progress (with confirmation)
 */
export function resetAllProgress() {
  if (window.confirm("Are you sure? This will clear all your saved progress.")) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("✅ All user progress cleared");
      return true;
    } catch (error) {
      console.error("Error clearing user progress:", error);
      return false;
    }
  }
  return false;
}

/**
 * Export progress data (for debugging or user download)
 */
export function exportProgress() {
  const progress = getUserProgress();
  return JSON.stringify(progress, null, 2);
}

/**
 * Get stats about user activity
 */
export function getUserStats() {
  const progress = getUserProgress();
  return {
    totalInterests: progress.interests.length,
    careersViewed: progress.viewedCareers.length,
    lastActive: progress.lastUpdated,
    hasExploredStream: !!progress.lastStream,
    completedOnboarding: progress.interests.length > 0
  };
}
