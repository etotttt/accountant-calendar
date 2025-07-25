// src/components/Calendar/MonthView.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HolidayData, ShortDayData, Task, TaxDeadlines } from '../../types';
import { formatDate, isWeekend } from '../../utils/dateUtils';

interface MonthViewProps {
  currentDate: Date;
  holidays: HolidayData;
  shortDays: ShortDayData;
  tasks: Task[];
  taxDeadlines: TaxDeadlines;
  onDateClick: (date: Date) => void;
  selectedDate: Date | null;
  vacationStart?: Date | null;
  vacationEnd?: Date | null;
  calculatorMode?: string;
}

const MonthView: React.FC<MonthViewProps> = ({ 
  currentDate, 
  holidays, 
  shortDays, 
  tasks, 
  taxDeadlines, 
  onDateClick, 
  selectedDate,
  vacationStart,
  vacationEnd,
  calculatorMode
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const days = [];
  // Предыдущий месяц
  for (let i = 0; i < startingDay; i++) {
    days.push({ 
      date: new Date(year, month, i - startingDay + 1), 
      isCurrentMonth: false 
    });
  }
  // Текущий месяц
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ 
      date: new Date(year, month, i), 
      isCurrentMonth: true 
    });
  }
  // Следующий месяц
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ 
      date: new Date(year, month + 1, i), 
      isCurrentMonth: false 
    });
  }

  const isInVacationRange = (date: Date): boolean => {
    if (!vacationStart || !vacationEnd || calculatorMode !== 'vacation') return false;
    return date > vacationStart && date < vacationEnd;
  };

  const getDateStatus = (date: Date): 'start' | 'end' | 'range' | 'single' | null => {
    if (calculatorMode !== 'vacation' || !vacationStart) return null;
    
    const dateStr = formatDate(date);
    const startStr = formatDate(vacationStart);
    
    if (!vacationEnd) {
      // Только начало выбрано
      return dateStr === startStr ? 'single' : null;
    }
    
    const endStr = formatDate(vacationEnd);
    
    if (dateStr === startStr && dateStr === endStr) return 'single';
    if (dateStr === startStr) return 'start';
    if (dateStr === endStr) return 'end';
    if (isInVacationRange(date)) return 'range';
    
    return null;
  };

  return (
    <View style={styles.monthView}>
      <View style={styles.weekDaysFullRow}>
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => (
          <Text key={i} style={styles.weekDayFull}>{d}</Text>
        ))}
      </View>

      <View style={styles.monthGrid}>
        {days.map(({ date, isCurrentMonth }, i) => {
          const dateStr = formatDate(date);
          const isHol = holidays[dateStr];
          const isWknd = isWeekend(date);
          const isShort = shortDays[dateStr];
          const dayTasks = tasks.filter(t => t.date === dateStr);
          const dayDeadline = taxDeadlines[dateStr];
          const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
          const dateStatus = getDateStatus(date);

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayFull,
                !isCurrentMonth && styles.dayFullOtherMonth,
                (isHol || isWknd) && isCurrentMonth && styles.dayFullHoliday,
                isShort && isCurrentMonth && styles.dayFullShort,
                isSelected && calculatorMode !== 'vacation' && styles.dayFullSelected,
                dateStatus === 'single' && styles.vacationSingle,
                dateStatus === 'start' && styles.vacationStart,
                dateStatus === 'end' && styles.vacationEnd,
                dateStatus === 'range' && styles.vacationRange,
              ]}
              onPress={() => onDateClick(date)}
            >
              <Text style={[
                styles.dayFullNumber,
                !isCurrentMonth && styles.dayFullNumberOther,
                (isHol || isWknd) && isCurrentMonth && styles.dayFullNumberHoliday,
                (dateStatus === 'start' || dateStatus === 'end' || dateStatus === 'single') && styles.dayFullNumberVacation,
              ]}>
                {date.getDate()}
              </Text>

              {isCurrentMonth && (
                <View style={styles.dayContent}>
                  {isHol && <Text style={styles.holidayName} numberOfLines={1}>{isHol}</Text>}
                  {isShort && <Text style={styles.shortDayText} numberOfLines={1}>{isShort}</Text>}
                  {dayDeadline && (
                    <View style={styles.deadlineTag}>
                      <Text style={styles.deadlineTagText} numberOfLines={1}>
                        {dayDeadline.title}
                      </Text>
                    </View>
                  )}
                  {dayTasks.map(task => (
                    <View key={task.id} style={[styles.taskTag, task.completed && styles.taskTagCompleted]}>
                      <Text style={[styles.taskTagText, task.completed && styles.taskTagTextCompleted]} numberOfLines={1}>
                        {task.title}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {calculatorMode === 'vacation' && (
        <View style={styles.vacationLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendStartColor]} />
            <Text style={styles.legendText}>
              {!vacationEnd ? 'Выбранная дата' : 'Начало отпуска'}
            </Text>
          </View>
          {vacationEnd && (
            <>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.legendRangeColor]} />
                <Text style={styles.legendText}>Период отпуска</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.legendEndColor]} />
                <Text style={styles.legendText}>Конец отпуска</Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  monthView: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  weekDaysFullRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
    marginBottom: 10
  },
  weekDayFull: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280'
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayFull: {
    width: '14.28%',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 4,
    marginBottom: -1,
    marginRight: -1
  },
  dayFullOtherMonth: {
    backgroundColor: '#f9fafb'
  },
  dayFullHoliday: {
    backgroundColor: '#fee2e2'
  },
  dayFullShort: {
    backgroundColor: '#fef3c7'
  },
  dayFullSelected: {
    borderColor: '#3b82f6',
    borderWidth: 2
  },
  vacationSingle: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    borderWidth: 2
  },
  vacationStart: {
    backgroundColor: '#10b981',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderColor: '#10b981',
    borderWidth: 2
  },
  vacationEnd: {
    backgroundColor: '#10b981',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderColor: '#10b981',
    borderWidth: 2
  },
  vacationRange: {
    backgroundColor: '#d1fae5'
  },
  dayFullNumber: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2
  },
  dayFullNumberOther: {
    color: '#9ca3af'
  },
  dayFullNumberHoliday: {
    color: '#dc2626',
    fontWeight: '600'
  },
  dayFullNumberVacation: {
    color: 'white',
    fontWeight: '600'
  },
  dayContent: {
    flex: 1
  },
  holidayName: {
    fontSize: 9,
    color: '#dc2626',
    marginBottom: 2
  },
  shortDayText: {
    fontSize: 9,
    color: '#d97706',
    marginBottom: 2
  },
  deadlineTag: {
    backgroundColor: '#fee2e2',
    borderRadius: 2,
    padding: 2,
    marginBottom: 2
  },
  deadlineTagText: {
    fontSize: 9,
    color: '#dc2626'
  },
  taskTag: {
    backgroundColor: '#dbeafe',
    borderRadius: 2,
    padding: 2,
    marginBottom: 2
  },
  taskTagCompleted: {
    backgroundColor: '#f3f4f6'
  },
  taskTagText: {
    fontSize: 9,
    color: '#3b82f6'
  },
  taskTagTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af'
  },
  vacationLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
    flexWrap: 'wrap'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4
  },
  legendStartColor: {
    backgroundColor: '#10b981'
  },
  legendRangeColor: {
    backgroundColor: '#d1fae5'
  },
  legendEndColor: {
    backgroundColor: '#10b981'
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280'
  }
});

export default MonthView;