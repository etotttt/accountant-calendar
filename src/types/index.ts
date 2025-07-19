// src/types/index.ts

export interface HolidayData {
    [date: string]: string;
}

export interface ShortDayData {
    [date: string]: string;
}

export interface CalendarYearData {
    holidays: HolidayData;
    shortDays: ShortDayData;
}

export interface StaticData {
    [year: number]: CalendarYearData;
}

export interface Task {
    id: number;
    date: string;
    title: string;
    completed: boolean;
}

export interface TaxDeadline {
    title: string;
    type: string;
    priority: 'high' | 'medium' | 'critical';
}

export interface TaxDeadlines {
    [date: string]: TaxDeadline;
}

export interface YearStats {
    total: {
        calendar: number;
        work: number;
        holiday: number;
    };
}

export type ViewType = 'year' | 'month';