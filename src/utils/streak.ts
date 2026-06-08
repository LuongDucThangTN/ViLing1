/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates current consecutive days of study (streak)
 * @param completedDates Array of YYYY-MM-DD date strings
 */
export function calculateStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;
  
  // Keep only unique dates sorted descendingally
  const sortedDates = Array.from(new Set(completedDates)).sort((a, b) => b.localeCompare(a));
  
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const today = formatDateString(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateString(yesterdayDate);

  let streak = 0;
  let currentDate = today;

  // Let's check status
  if (!sortedDates.includes(today)) {
    if (!sortedDates.includes(yesterday)) {
      return 0; // Broken streak
    }
    currentDate = yesterday;
  }

  const checkDate = new Date(currentDate);
  while (true) {
    const formatted = formatDateString(checkDate);
    if (sortedDates.includes(formatted)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1); // move back one day
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get active dates for the current week (7 days leading to today) to render a visual ring-tracker
 */
export interface WeekDayStatus {
  dayName: string;
  formattedDate: string;
  isToday: boolean;
  completed: boolean;
}

export function getWeekStatus(completedDates: string[]): WeekDayStatus[] {
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const statusList: WeekDayStatus[] = [];
  
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDateString(new Date());

  // Generate status for the last 7 days (index 6 to 0, representing 6 days before today up to today)
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const formattedDate = formatDateString(d);
    
    statusList.push({
      dayName: daysOfWeek[d.getDay()],
      formattedDate,
      isToday: formattedDate === todayStr,
      completed: completedDates.includes(formattedDate),
    });
  }

  return statusList;
}
