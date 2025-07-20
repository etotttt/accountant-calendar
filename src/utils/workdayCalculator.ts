import { formatDate } from './dateUtils';

export interface WorkDayResult {
  workDays: number;
  totalDays: number;
}

export const calculateWorkDays = (
  start: Date,
  end: Date,
  holidays: Record<string, string>
): WorkDayResult => {
  let work = 0, total = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    total++;
    const day = d.getDay();
    if (day !== 0 && day !== 6 && !holidays[formatDate(d)]) {
      work++;
    }
  }
  return { workDays: work, totalDays: total };
};