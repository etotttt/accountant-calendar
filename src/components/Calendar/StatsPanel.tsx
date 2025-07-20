// src/components/Calendar/StatsPanel.tsx
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HolidayData, ShortDayData } from '../../types';
import { formatDate, isWeekend } from '../../utils/dateUtils';

interface StatsPanelProps {
  year: number;
  month?: number; // Если не указан, показываем статистику за год
  holidays: HolidayData;
  shortDays: ShortDayData;
}

interface PeriodStats {
  calendar: number;
  work: number;
  holiday: number;
  hours40: number;
  hours36: number;
  hours24: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ year, month, holidays, shortDays }) => {
  const stats = useMemo(() => {
    const periodStats: PeriodStats = {
      calendar: 0,
      work: 0,
      holiday: 0,
      hours40: 0,
      hours36: 0,
      hours24: 0
    };

    // Определяем период для расчета
    const startMonth = month !== undefined ? month : 0;
    const endMonth = month !== undefined ? month : 11;

    for (let m = startMonth; m <= endMonth; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, m, d);
        const dateStr = formatDate(date);
        
        periodStats.calendar++;
        
        if (isWeekend(date) || holidays[dateStr]) {
          periodStats.holiday++;
        } else {
          periodStats.work++;
          
          // Расчет часов
          const isShort = shortDays[dateStr];
          const hoursInDay = isShort ? 7 : 8;
          
          periodStats.hours40 += hoursInDay;
          periodStats.hours36 += isShort ? 6.4 : 7.2; // 36/5 = 7.2 часа в день
          periodStats.hours24 += isShort ? 4.3 : 4.8; // 24/5 = 4.8 часа в день
        }
      }
    }

    // Округляем часы до одного знака
    periodStats.hours36 = Math.round(periodStats.hours36 * 10) / 10;
    periodStats.hours24 = Math.round(periodStats.hours24 * 10) / 10;

    return periodStats;
  }, [year, month, holidays, shortDays]);

  const title = month !== undefined 
    ? new Date(year, month).toLocaleString('ru-RU', { month: 'long', year: 'numeric' })
    : `${year} год`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Статистика за {title}</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Календарные дни</Text>
          <Text style={styles.statValue}>{stats.calendar}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Рабочие дни</Text>
          <Text style={styles.statValue}>{stats.work}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Выходные и праздничные</Text>
          <Text style={styles.statValue}>{stats.holiday}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.hoursTitle}>Норма рабочего времени (часов):</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>40-часовая неделя</Text>
          <Text style={styles.statValue}>{stats.hours40}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>36-часовая неделя</Text>
          <Text style={styles.statValue}>{stats.hours36}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>24-часовая неделя</Text>
          <Text style={styles.statValue}>{stats.hours24}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937'
  },
  statsGrid: {
    gap: 12
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 15,
    color: '#4b5563'
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4
  }
});

export default StatsPanel;