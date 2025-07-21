// src/styles/calendarStyles.ts
import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Адаптивные размеры шрифтов
const fontScale = screenWidth < 380 ? 0.9 : 1;

export const calendarStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f3f4f6' 
  },
  
  // Улучшенный header с безопасными отступами
  header: { 
    backgroundColor: 'white', 
    paddingTop: Platform.select({
      ios: 60, // Увеличено для iPhone с notch
      android: 40
    }), 
    paddingBottom: 15, 
    paddingHorizontal: 16, // Уменьшено для большего пространства
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 5 
  },
  
  titleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    flexWrap: 'wrap' // Позволяет переносить на новую строку
  },
  
  title: { 
    fontSize: 20 * fontScale, // Адаптивный размер
    fontWeight: 'bold', 
    marginLeft: 8, 
    color: '#1f2937',
    flex: 1, // Занимает доступное пространство
    flexWrap: 'wrap'
  },
  
  navigation: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12
  },
  
  navButton: { 
    padding: 8, // Уменьшено для экономии места
    marginHorizontal: 4
  },
  
  currentPeriod: { 
    fontSize: 16 * fontScale, 
    fontWeight: '600', 
    marginHorizontal: 12, 
    minWidth: 120, // Уменьшено
    textAlign: 'center', 
    textTransform: 'capitalize'
  },
  
  viewSwitch: { 
    flexDirection: 'row', 
    backgroundColor: '#f3f4f6', 
    borderRadius: 8, 
    padding: 2,
    alignSelf: 'center', // Центрирование
    width: '60%', // Ограничение ширины
    minWidth: 140
  },
  
  viewButton: { 
    flex: 1, 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  
  viewButtonActive: { 
    backgroundColor: '#3b82f6' 
  },
  
  viewButtonText: { 
    fontSize: 13 * fontScale, 
    fontWeight: '600', 
    color: '#6b7280' 
  },
  
  viewButtonTextActive: { 
    color: 'white' 
  },
  
  // ScrollView с отступом для FAB кнопок
  content: { 
    flex: 1,
    paddingHorizontal: 12, // Уменьшено
    paddingTop: 10,
    paddingBottom: 100 // Увеличено для FAB кнопок
  },
  
  // Улучшенные FAB кнопки с правильным позиционированием
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    flexDirection: 'column',
    gap: 12
  },
  
  fab: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#10b981', 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 8 
  },
  
  fabSecondary: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#3b82f6', 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 8 
  },
  
  // Статистика с улучшенным spacing
  statsCard: { 
    backgroundColor: 'white', 
    borderRadius: 8, 
    padding: 16, 
    marginTop: 16,
    marginBottom: 20, // Добавлен отступ снизу
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 3 
  },
  
  statsTitle: { 
    fontSize: 16 * fontScale, 
    fontWeight: '600', 
    marginBottom: 12, 
    color: '#1f2937' 
  },
  
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around',
    flexWrap: 'wrap', // Позволяет переносить элементы
    gap: 8
  },
  
  statItem: { 
    alignItems: 'center',
    minWidth: 80 // Минимальная ширина
  },
  
  statValue: { 
    fontSize: 22 * fontScale, 
    fontWeight: 'bold', 
    color: '#1f2937' 
  },
  
  statLabel: { 
    fontSize: 11 * fontScale, 
    color: '#6b7280', 
    marginTop: 4,
    textAlign: 'center'
  }
});

// Стили для годового представления
export const yearViewStyles = StyleSheet.create({
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4
  },
  
  monthMiniCard: {
    width: screenWidth < 380 ? '48%' : (screenWidth - 36) / 2 - 6,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: screenWidth < 380 ? 8 : 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  
  monthMiniTitle: {
    fontSize: 15 * fontScale,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    textTransform: 'capitalize'
  },
  
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 2
  },
  
  weekDayMini: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9 * fontScale,
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
    padding: 1
  },
  
  dayMiniText: {
    fontSize: 10 * fontScale,
    color: '#374151'
  }
});

// Стили для месячного представления
export const monthViewStyles = StyleSheet.create({
  monthView: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
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
    paddingBottom: 8,
    marginBottom: 8
  },
  
  weekDayFull: {
    flex: 1,
    textAlign: 'center',
    fontSize: screenWidth < 380 ? 10 : 11,
    fontWeight: '600',
    color: '#6b7280'
  },
  
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  
  dayFull: {
    width: '14.28%',
    minHeight: screenWidth < 380 ? 60 : 70,
    borderWidth: 0.5, // Тоньше границы
    borderColor: '#e5e7eb',
    padding: screenWidth < 380 ? 2 : 3,
    marginBottom: -0.5,
    marginRight: -0.5
  },
  
  dayFullNumber: {
    fontSize: screenWidth < 380 ? 12 : 13,
    fontWeight: '500',
    marginBottom: 1
  },
  
  dayContent: {
    flex: 1,
    overflow: 'hidden' // Предотвращает выход контента за границы
  },
  
  holidayName: {
    fontSize: 8,
    color: '#dc2626',
    marginBottom: 1,
    lineHeight: 10
  },
  
  shortDayText: {
    fontSize: 8,
    color: '#d97706',
    marginBottom: 1,
    lineHeight: 10
  },
  
  deadlineTag: {
    backgroundColor: '#fee2e2',
    borderRadius: 2,
    paddingHorizontal: 2,
    paddingVertical: 1,
    marginBottom: 1
  },
  
  deadlineTagText: {
    fontSize: 7,
    color: '#dc2626',
    lineHeight: 9
  },
  
  taskTag: {
    backgroundColor: '#dbeafe',
    borderRadius: 2,
    paddingHorizontal: 2,
    paddingVertical: 1,
    marginBottom: 1
  },
  
  taskTagText: {
    fontSize: 7,
    color: '#3b82f6',
    lineHeight: 9
  }
});

// Стили для панели статистики
export const statsPanelStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  
  title: {
    fontSize: 17 * fontScale,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937'
  },
  
  statsGrid: {
    gap: 10
  },
  
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2
  },
  
  statLabel: {
    fontSize: 14 * fontScale,
    color: '#4b5563',
    flex: 1
  },
  
  statValue: {
    fontSize: 16 * fontScale,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 50,
    textAlign: 'right'
  },
  
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10
  },
  
  hoursTitle: {
    fontSize: 13 * fontScale,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6
  }
});