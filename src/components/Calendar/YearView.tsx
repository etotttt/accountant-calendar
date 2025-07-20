// src/components/Calendar/YearView.tsx
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HolidayData, ShortDayData, Task, TaxDeadlines } from '../../types';
import { formatDate, getDaysInMonth, getFirstDayOfWeek, getMonthName, isWeekend } from '../../utils/dateUtils';

const { width: screenWidth } = Dimensions.get('window');

interface YearViewProps {
  year: number;
  holidays: HolidayData;
  shortDays: ShortDayData;
  tasks: Task[];
  taxDeadlines: TaxDeadlines;
  onDateClick: (date: Date) => void;
}

interface MonthMiniCardProps {
  month: number;
  year: number;
  holidays: HolidayData;
  shortDays: ShortDayData;
  tasks: Task[];
  taxDeadlines: TaxDeadlines;
  onDateClick: (date: Date) => void;
}

const MonthMiniCard: React.FC<MonthMiniCardProps> = ({ 
  month, 
  year, 
  holidays, 
  shortDays, 
  tasks, 
  taxDeadlines, 
  onDateClick 
}) => {
  const monthName = getMonthName(new Date(year, month));
  const daysInMonth = getDaysInMonth(year, month);
  const startingDay = getFirstDayOfWeek(year, month);

  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  return (
    <View style={styles.monthMiniCard}>
      <Text style={styles.monthMiniTitle}>{monthName}</Text>
      <View style={styles.weekDaysRow}>
        {['П', 'В', 'С', 'Ч', 'П', 'С', 'В'].map((d, i) => (
          <Text key={i} style={styles.weekDayMini}>{d}</Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {Array.from({ length: startingDay }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.dayMini} />
        ))}
        {days.map(date => {
          const dateStr = formatDate(date);
          const isHol = holidays[dateStr];
          const isWknd = isWeekend(date);
          const hasTask = tasks.some(t => t.date === dateStr);
          const hasDeadline = taxDeadlines[dateStr];

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayMini,
                (isHol || isWknd) && styles.dayMiniHoliday,
                shortDays[dateStr] && styles.dayMiniShort,
              ]}
              onPress={() => onDateClick(date)}
            >
              <Text style={[
                styles.dayMiniText,
                (isHol || isWknd) && styles.dayMiniTextHoliday
              ]}>
                {date.getDate()}
              </Text>
              {(hasTask || hasDeadline) && (
                <View style={styles.dayIndicators}>
                  {hasTask && <View style={styles.taskDot} />}
                  {hasDeadline && <View style={styles.deadlineDot} />}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const YearView: React.FC<YearViewProps> = ({ 
  year, 
  holidays, 
  shortDays, 
  tasks, 
  taxDeadlines, 
  onDateClick 
}) => {
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <View style={styles.yearGrid}>
      {months.map(month => (
        <MonthMiniCard
          key={month}
          month={month}
          year={year}
          holidays={holidays}
          shortDays={shortDays}
          tasks={tasks}
          taxDeadlines={taxDeadlines}
          onDateClick={onDateClick}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  monthMiniCard: {
    width: (screenWidth - 40) / 2 - 5,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  monthMiniTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'capitalize'
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  weekDayMini: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280'
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayMini: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2
  },
  dayMiniHoliday: {
    backgroundColor: '#fee2e2',
    borderRadius: 4
  },
  dayMiniShort: {
    backgroundColor: '#fef3c7',
    borderRadius: 4
  },
  dayMiniText: {
    fontSize: 11,
    color: '#374151'
  },
  dayMiniTextHoliday: {
    color: '#dc2626',
    fontWeight: '600'
  },
  dayIndicators: {
    position: 'absolute',
    bottom: 1,
    flexDirection: 'row',
    gap: 2
  },
  taskDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#3b82f6'
  },
  deadlineDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#dc2626'
  }
});

export default YearView;