// src/utils/dateUtils.ts

export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const isWeekend = (date: Date): boolean => {
    return date.getDay() === 0 || date.getDay() === 6;
};

export const getMonthName = (date: Date): string => {
    return date.toLocaleString('ru-RU', { month: 'long' });
};

export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfWeek = (year: number, month: number): number => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
};