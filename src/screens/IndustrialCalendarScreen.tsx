// src/screens/IndustrialCalendarScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCalendarData } from '../hooks/useCalendarData';
import { formatDate } from '../utils/dateUtils';

const { width: screenWidth } = Dimensions.get('window');

type PeriodType = 'year' | 'quarter' | 'month';
type WeekType = '5-day' | '6-day';

interface IndustrialCalendarScreenProps {
  disabled?: boolean;
}

interface PeriodStats {
  calendarDays: number;
  workDays: number;
  holidays: number;
  hours40: number;
  hours36: number;
  hours24: number;
}

export default function IndustrialCalendarScreen({ disabled }: IndustrialCalendarScreenProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [periodType, setPeriodType] = useState<PeriodType>('year');
  const [weekType, setWeekType] = useState<WeekType>('5-day');
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(0);
  
  const { holidays, shortDays, isDataAvailable } = useCalendarData(currentYear);
  const insets = useSafeAreaInsets();

  // Уменьшенный padding для лучшего использования пространства
  const paddingTop = Platform.select({
    ios: Math.max(insets.top, 20) - 10,
    android: (StatusBar.currentHeight || 20) - 10
  });

  // Расчет статистики для периода
  const calculatePeriodStats = (startMonth: number, endMonth: number): PeriodStats => {
    const stats: PeriodStats = {
      calendarDays: 0,
      workDays: 0,
      holidays: 0,
      hours40: 0,
      hours36: 0,
      hours24: 0,
    };

    for (let month = startMonth; month <= endMonth; month++) {
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, month, day);
        const dateStr = formatDate(date);
        const dayOfWeek = date.getDay();
        
        stats.calendarDays++;
        
        const isHoliday = holidays[dateStr];
        const isShortDay = shortDays[dateStr];
        const isWeekendDay = weekType === '5-day' 
          ? (dayOfWeek === 0 || dayOfWeek === 6)
          : dayOfWeek === 0;
        
        if (isHoliday || isWeekendDay) {
          stats.holidays++;
        } else {
          stats.workDays++;
          const hoursInDay = isShortDay ? 7 : 8;
          stats.hours40 += hoursInDay;
          stats.hours36 += isShortDay ? 6.3 : 7.2;
          stats.hours24 += isShortDay ? 4.2 : 4.8;
        }
      }
    }

    // Округление часов
    stats.hours36 = Math.round(stats.hours36 * 10) / 10;
    stats.hours24 = Math.round(stats.hours24 * 10) / 10;

    return stats;
  };

  // Получение статистики в зависимости от выбранного периода
  const periodStats = useMemo(() => {
    if (periodType === 'year') {
      return calculatePeriodStats(0, 11);
    } else if (periodType === 'quarter') {
      const startMonth = (selectedQuarter - 1) * 3;
      const endMonth = startMonth + 2;
      return calculatePeriodStats(startMonth, endMonth);
    } else {
      return calculatePeriodStats(selectedMonth, selectedMonth);
    }
  }, [currentYear, periodType, selectedQuarter, selectedMonth, weekType, holidays, shortDays]);

  // Статистика по кварталам
  const quarterStats = useMemo(() => {
    const stats = [];
    for (let q = 0; q < 4; q++) {
      const startMonth = q * 3;
      const endMonth = startMonth + 2;
      stats.push(calculatePeriodStats(startMonth, endMonth));
    }
    return stats;
  }, [currentYear, weekType, holidays, shortDays]);

  // Статистика по месяцам
  const monthStats = useMemo(() => {
    const stats = [];
    for (let m = 0; m < 12; m++) {
      stats.push(calculatePeriodStats(m, m));
    }
    return stats;
  }, [currentYear, weekType, holidays, shortDays]);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const quarterNames = ['I квартал', 'II квартал', 'III квартал', 'IV квартал'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop }]}>
        <View style={styles.titleRow}>
          <Ionicons name="business" size={24} color="#3b82f6" />
          <Text style={styles.title}>Производственный календарь</Text>
        </View>

        {/* Year Navigation */}
        <View style={styles.yearNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setCurrentYear(currentYear - 1)}
          >
            <Ionicons name="chevron-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.yearText}>{currentYear}</Text>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setCurrentYear(currentYear + 1)}
          >
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Week Type Selector */}
        <View style={styles.weekTypeSelector}>
          <TouchableOpacity
            style={[
              styles.weekTypeButton,
              weekType === '5-day' && styles.weekTypeButtonActive
            ]}
            onPress={() => setWeekType('5-day')}
          >
            <Text style={[
              styles.weekTypeText,
              weekType === '5-day' && styles.weekTypeTextActive
            ]}>
              5-дневная неделя
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.weekTypeButton,
              weekType === '6-day' && styles.weekTypeButtonActive
            ]}
            onPress={() => setWeekType('6-day')}
          >
            <Text style={[
              styles.weekTypeText,
              weekType === '6-day' && styles.weekTypeTextActive
            ]}>
              6-дневная неделя
            </Text>
          </TouchableOpacity>
        </View>

        {/* Period Type Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              periodType === 'year' && styles.periodButtonActive
            ]}
            onPress={() => setPeriodType('year')}
          >
            <Text style={[
              styles.periodText,
              periodType === 'year' && styles.periodTextActive
            ]}>
              Год
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              periodType === 'quarter' && styles.periodButtonActive
            ]}
            onPress={() => setPeriodType('quarter')}
          >
            <Text style={[
              styles.periodText,
              periodType === 'quarter' && styles.periodTextActive
            ]}>
              Квартал
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              periodType === 'month' && styles.periodButtonActive
            ]}
            onPress={() => setPeriodType('month')}
          >
            <Text style={[
              styles.periodText,
              periodType === 'month' && styles.periodTextActive
            ]}>
              Месяц
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isDataAvailable && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            Данные для {currentYear} года отсутствуют
          </Text>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Stats Card */}
        <View style={styles.mainStatsCard}>
          <Text style={styles.statsTitle}>
            {periodType === 'year' && `${currentYear} год`}
            {periodType === 'quarter' && quarterNames[selectedQuarter - 1]}
            {periodType === 'month' && monthNames[selectedMonth]}
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{periodStats.calendarDays}</Text>
              <Text style={styles.statLabel}>Календарных дней</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{periodStats.workDays}</Text>
              <Text style={styles.statLabel}>Рабочих дней</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{periodStats.holidays}</Text>
              <Text style={styles.statLabel}>Выходных и праздничных</Text>
            </View>
          </View>

          <View style={styles.hoursSection}>
            <Text style={styles.hoursTitle}>Норма рабочего времени (часов)</Text>
            <View style={styles.hoursGrid}>
              <View style={styles.hourItem}>
                <Text style={styles.hourLabel}>40-часовая</Text>
                <Text style={styles.hourValue}>{periodStats.hours40}</Text>
              </View>
              <View style={styles.hourItem}>
                <Text style={styles.hourLabel}>36-часовая</Text>
                <Text style={styles.hourValue}>{periodStats.hours36}</Text>
              </View>
              <View style={styles.hourItem}>
                <Text style={styles.hourLabel}>24-часовая</Text>
                <Text style={styles.hourValue}>{periodStats.hours24}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Period Selector for Quarter/Month */}
        {periodType === 'quarter' && (
          <View style={styles.periodGrid}>
            {quarterNames.map((name, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quarterCard,
                  selectedQuarter === index + 1 && styles.quarterCardActive
                ]}
                onPress={() => setSelectedQuarter(index + 1)}
              >
                <Text style={[
                  styles.quarterName,
                  selectedQuarter === index + 1 && styles.quarterNameActive
                ]}>
                  {name}
                </Text>
                <View style={styles.quarterStats}>
                  <Text style={styles.quarterStatText}>
                    Дней: {quarterStats[index].calendarDays}
                  </Text>
                  <Text style={styles.quarterStatText}>
                    Рабочих: {quarterStats[index].workDays}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {periodType === 'month' && (
          <View style={styles.monthGrid}>
            {monthNames.map((name, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.monthCard,
                  selectedMonth === index && styles.monthCardActive
                ]}
                onPress={() => setSelectedMonth(index)}
              >
                <Text style={[
                  styles.monthName,
                  selectedMonth === index && styles.monthNameActive
                ]}>
                  {name}
                </Text>
                <View style={styles.monthStats}>
                  <View style={styles.monthStatRow}>
                    <Text style={styles.monthStatLabel}>Дней:</Text>
                    <Text style={styles.monthStatValue}>{monthStats[index].calendarDays}</Text>
                  </View>
                  <View style={styles.monthStatRow}>
                    <Text style={styles.monthStatLabel}>Раб:</Text>
                    <Text style={styles.monthStatValue}>{monthStats[index].workDays}</Text>
                  </View>
                  <View style={styles.monthStatRow}>
                    <Text style={styles.monthStatLabel}>Вых:</Text>
                    <Text style={styles.monthStatValue}>{monthStats[index].holidays}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Detailed breakdown tables */}
        {periodType === 'year' && (
          <>
            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownTitle}>Разбивка по кварталам</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellFirst]}>
                    Период
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellNumber]}>
                    Дней
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellNumber]}>
                    Раб.
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellNumber]}>
                    Вых.
                  </Text>
                </View>
                {quarterNames.map((name, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableCellFirst]}>{name}</Text>
                    <Text style={[styles.tableCell, styles.tableCellNumber]}>
                      {quarterStats[index].calendarDays}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellNumber]}>
                      {quarterStats[index].workDays}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellNumber]}>
                      {quarterStats[index].holidays}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownTitle}>Разбивка по месяцам</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellFirst]}>
                    Месяц
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellNumber]}>
                    Дней
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellNumber]}>
                    Раб.
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellNumber]}>
                    Вых.
                  </Text>
                </View>
                {monthNames.map((name, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableCellFirst]}>{name}</Text>
                    <Text style={[styles.tableCell, styles.tableCellNumber]}>
                      {monthStats[index].calendarDays}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellNumber]}>
                      {monthStats[index].workDays}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellNumber]}>
                      {monthStats[index].holidays}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  yearNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  navButton: {
    padding: 6,
  },
  yearText: {
    fontSize: 17,
    fontWeight: '600',
    marginHorizontal: 24,
    minWidth: 60,
    textAlign: 'center',
  },
  weekTypeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
    marginBottom: 6,
  },
  weekTypeButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  weekTypeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  weekTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  weekTypeTextActive: {
    color: 'white',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  periodButtonActive: {
    backgroundColor: '#e0e7ff',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  periodTextActive: {
    color: '#4338ca',
    fontWeight: '600',
  },
  warning: {
    backgroundColor: '#fee2e2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  warningText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mainStatsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 90,
    lineHeight: 14,
  },
  hoursSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
    textAlign: 'center',
  },
  hoursGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  hourItem: {
    alignItems: 'center',
  },
  hourLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  hourValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
  },
  periodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  quarterCard: {
    width: (screenWidth - 44) / 2,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quarterCardActive: {
    borderColor: '#3b82f6',
  },
  quarterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  quarterNameActive: {
    color: '#3b82f6',
  },
  quarterStats: {
    gap: 4,
  },
  quarterStatText: {
    fontSize: 13,
    color: '#6b7280',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  monthCard: {
    width: (screenWidth - 48) / 3,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  monthCardActive: {
    borderColor: '#3b82f6',
  },
  monthName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  monthNameActive: {
    color: '#3b82f6',
  },
  monthStats: {
    gap: 2,
  },
  monthStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthStatLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  monthStatValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
  },
  breakdownSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
  },
  tableCellHeader: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: 12,
  },
  tableCellFirst: {
    flex: 2,
    textAlign: 'left',
    paddingLeft: 12,
  },
  tableCellNumber: {
    minWidth: 50,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});