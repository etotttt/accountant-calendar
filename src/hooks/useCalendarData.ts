import { useMemo } from 'react';
import { staticCalendarData } from '../constants/calendarData';

export const useCalendarData = (year: number) => {
    return useMemo(() => {
        const data = staticCalendarData[year] || { holidays: {}, shortDays: {} };
        return {
            ...data,
            isDataAvailable: !!staticCalendarData[year]
        };
    }, [year]);
};