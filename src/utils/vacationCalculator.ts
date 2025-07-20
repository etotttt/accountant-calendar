// src/utils/vacationCalculator.ts
import { HolidayData } from '../types';
import { formatDate, isWeekend } from './dateUtils';

export interface VacationCalculationResult {
  calendarDays: number;
  vacationDays: number;
  dailyRate: number;
  gross: number;
  ndfl: number;
  net: number;
}

/**
 * Расчет отпускных по российскому законодательству
 * @param startDate - дата начала отпуска
 * @param endDate - дата окончания отпуска
 * @param averageSalary - средняя зарплата за 12 месяцев
 * @param holidays - праздничные дни
 */
export const calculateVacationDays = (
  startDate: Date,
  endDate: Date,
  averageSalary: number,
  holidays: HolidayData
): VacationCalculationResult => {
  // Среднее количество календарных дней в месяце для расчета отпускных
  const AVERAGE_DAYS_IN_MONTH = 29.3;
  
  // Подсчет календарных дней
  let calendarDays = 0;
  let vacationDays = 0;
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    calendarDays++;
    
    // В отпускные дни не входят праздничные дни
    const dateStr = formatDate(currentDate);
    const isHoliday = holidays[dateStr];
    
    // Праздничные дни исключаются из отпуска и продлевают его
    if (!isHoliday) {
      vacationDays++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Расчет среднедневного заработка
  const dailyRate = averageSalary / AVERAGE_DAYS_IN_MONTH;
  
  // Расчет отпускных
  const gross = dailyRate * vacationDays;
  const ndfl = Math.round(gross * 0.13); // НДФЛ 13%
  const net = gross - ndfl;
  
  return {
    calendarDays,
    vacationDays,
    dailyRate,
    gross,
    ndfl,
    net
  };
};

/**
 * Расчет количества рабочих дней между датами
 */
export const calculateWorkingDays = (
  startDate: Date,
  endDate: Date,
  holidays: HolidayData
): number => {
  let workingDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);
    const isHoliday = holidays[dateStr];
    const isWeekendDay = isWeekend(currentDate);
    
    if (!isHoliday && !isWeekendDay) {
      workingDays++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};