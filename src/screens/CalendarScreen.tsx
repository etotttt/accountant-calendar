// src/screens/CalendarScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Импорт компонентов
import MonthView from '../components/Calendar/MonthView';
import StatsPanel from '../components/Calendar/StatsPanel';
import YearView from '../components/Calendar/YearView';
import DateDetailsModal from '../components/Modals/DateDetailsModal';
import WorkdayCalculatorModal from '../components/Modals/WorkdayCalculatorModal';

// Импорт хуков и утилит
import { taxDeadlines } from '../constants/calendarData';
import { useCalendarData } from '../hooks/useCalendarData';
import { useTasks } from '../hooks/useTasks';
import { calculateVacationDays } from '../utils/vacationCalculator';

// Типы
import { ViewType } from '../types';

type CalculatorMode = 'none' | 'vacation';

export default function CalendarScreen() {
  const [view, setView] = useState<ViewType>('year');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [tasks, updateTasks] = useTasks();
  const [showDateDetails, setShowDateDetails] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const { holidays, shortDays, isDataAvailable } = useCalendarData(currentDate.getFullYear());
  
  // Состояния для режима расчета отпускных
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>('none');
  const [vacationStart, setVacationStart] = useState<Date | null>(null);
  const [vacationEnd, setVacationEnd] = useState<Date | null>(null);
  const [salary, setSalary] = useState('');
  const [vacationResult, setVacationResult] = useState<any>(null);

  const handleDateClick = (date: Date) => {
    if (calculatorMode === 'vacation') {
      // В режиме расчета отпускных выбираем даты
      if (!vacationStart) {
        setVacationStart(date);
      } else if (!vacationEnd) {
        if (date >= vacationStart) {
          setVacationEnd(date);
          // Автоматически рассчитываем если есть зарплата
          if (salary) {
            calculateVacation(vacationStart, date, salary);
          }
        } else {
          Alert.alert('Ошибка', 'Дата окончания должна быть позже даты начала');
        }
      } else {
        // Сброс выбора
        setVacationStart(date);
        setVacationEnd(null);
        setVacationResult(null);
      }
    } else {
      // Обычный режим
      setSelectedDate(date);
      if (view === 'year') {
        setCurrentDate(date);
        setView('month');
      } else {
        setShowDateDetails(true);
      }
    }
  };

  const changeMonth = (amount: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
  };

  const changeYear = (amount: number) => {
    setCurrentDate(new Date(currentDate.getFullYear() + amount, currentDate.getMonth(), 1));
  };

  const startVacationCalculator = () => {
    setCalculatorMode('vacation');
    setVacationStart(null);
    setVacationEnd(null);
    setSalary('');
    setVacationResult(null);
  };

  const cancelVacationCalculator = () => {
    setCalculatorMode('none');
    setVacationStart(null);
    setVacationEnd(null);
    setSalary('');
    setVacationResult(null);
  };

  const calculateVacation = (start: Date, end: Date, salaryStr: string) => {
    const avgSalary = parseFloat(salaryStr);
    if (isNaN(avgSalary)) {
      Alert.alert('Ошибка', 'Введите корректную сумму зарплаты');
      return;
    }

    const result = calculateVacationDays(start, end, avgSalary, holidays);
    setVacationResult(result);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar" size={32} color="#3b82f6" />
          <Text style={styles.title}>Производственный календарь</Text>
        </View>
        
        {calculatorMode === 'vacation' && (
          <View style={styles.vacationMode}>
            <Text style={styles.vacationModeText}>Режим расчета отпускных</Text>
            <TouchableOpacity onPress={cancelVacationCalculator}>
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.navigation}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => view === 'year' ? changeYear(-1) : changeMonth(-1)}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.currentPeriod}>
            {view === 'year' 
              ? currentDate.getFullYear() 
              : currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => view === 'year' ? changeYear(1) : changeMonth(1)}
          >
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.viewSwitch}>
          <TouchableOpacity 
            style={[styles.viewButton, view === 'month' && styles.viewButtonActive]} 
            onPress={() => setView('month')}
          >
            <Text style={[styles.viewButtonText, view === 'month' && styles.viewButtonTextActive]}>
              Месяц
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewButton, view === 'year' && styles.viewButtonActive]} 
            onPress={() => setView('year')}
          >
            <Text style={[styles.viewButtonText, view === 'year' && styles.viewButtonTextActive]}>
              Год
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isDataAvailable && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            Данные для {currentDate.getFullYear()} года отсутствуют
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Форма расчета отпускных */}
        {calculatorMode === 'vacation' && (
          <View style={styles.vacationCalculator}>
            <Text style={styles.vacationTitle}>Расчет отпускных</Text>
            <Text style={styles.vacationHint}>
              Выберите даты отпуска на календаре или введите вручную
            </Text>
            
            <View style={styles.vacationDates}>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>Начало:</Text>
                <Text style={styles.dateValue}>
                  {vacationStart ? vacationStart.toLocaleDateString('ru-RU') : 'Не выбрано'}
                </Text>
              </View>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>Конец:</Text>
                <Text style={styles.dateValue}>
                  {vacationEnd ? vacationEnd.toLocaleDateString('ru-RU') : 'Не выбрано'}
                </Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Средняя зарплата за 12 месяцев:</Text>
            <TextInput
              style={styles.salaryInput}
              value={salary}
              onChangeText={setSalary}
              placeholder="Введите сумму"
              keyboardType="numeric"
            />

            {vacationStart && vacationEnd && salary && (
              <TouchableOpacity 
                style={styles.calculateButton}
                onPress={() => calculateVacation(vacationStart, vacationEnd, salary)}
              >
                <Text style={styles.calculateButtonText}>Рассчитать</Text>
              </TouchableOpacity>
            )}

            {vacationResult && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Результат расчета:</Text>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Календарных дней:</Text>
                  <Text style={styles.resultValue}>{vacationResult.calendarDays}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Отпускных дней:</Text>
                  <Text style={styles.resultValue}>{vacationResult.vacationDays}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Среднедневной заработок:</Text>
                  <Text style={styles.resultValue}>{vacationResult.dailyRate.toFixed(2)} ₽</Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Начислено:</Text>
                  <Text style={styles.resultValue}>{vacationResult.gross.toFixed(2)} ₽</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>НДФЛ (13%):</Text>
                  <Text style={styles.resultValue}>{vacationResult.ndfl.toFixed(2)} ₽</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabelBold}>К выплате:</Text>
                  <Text style={styles.resultValueBold}>{vacationResult.net.toFixed(2)} ₽</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {view === 'year' ? (
          <YearView 
            year={currentDate.getFullYear()} 
            holidays={holidays} 
            shortDays={shortDays} 
            tasks={tasks} 
            taxDeadlines={taxDeadlines} 
            onDateClick={handleDateClick} 
          />
        ) : (
          <MonthView 
            currentDate={currentDate} 
            holidays={holidays} 
            shortDays={shortDays} 
            tasks={tasks} 
            taxDeadlines={taxDeadlines} 
            onDateClick={handleDateClick} 
            selectedDate={selectedDate}
            vacationStart={vacationStart}
            vacationEnd={vacationEnd}
            calculatorMode={calculatorMode}
          />
        )}
        
        {/* Статистика */}
        <StatsPanel 
          year={currentDate.getFullYear()} 
          month={view === 'month' ? currentDate.getMonth() : undefined}
          holidays={holidays} 
          shortDays={shortDays} 
        />
      </ScrollView>

      {/* Кнопки действий */}
      <TouchableOpacity 
        style={[styles.fab, calculatorMode !== 'none' && styles.fabHidden]} 
        onPress={startVacationCalculator}
      >
        <Ionicons name="cash-outline" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.fabSecondary, calculatorMode !== 'none' && styles.fabHidden]} 
        onPress={() => setShowCalculator(true)}
      >
        <Ionicons name="calculator" size={24} color="white" />
      </TouchableOpacity>

      <DateDetailsModal 
        visible={showDateDetails} 
        onClose={() => setShowDateDetails(false)} 
        date={selectedDate} 
        holidays={holidays} 
        shortDays={shortDays} 
        tasks={tasks} 
        taxDeadlines={taxDeadlines} 
        onTasksUpdate={updateTasks} 
      />
      
      <WorkdayCalculatorModal 
        visible={showCalculator} 
        onClose={() => setShowCalculator(false)} 
        holidays={holidays} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f3f4f6' 
  },
  header: { 
    backgroundColor: 'white', 
    paddingTop: Platform.OS === 'ios' ? 50 : 30, 
    paddingBottom: 15, 
    paddingHorizontal: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 5 
  },
  titleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginLeft: 10, 
    color: '#1f2937' 
  },
  navigation: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 15 
  },
  navButton: { 
    padding: 10 
  },
  currentPeriod: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginHorizontal: 20, 
    minWidth: 150, 
    textAlign: 'center', 
    textTransform: 'capitalize' 
  },
  viewSwitch: { 
    flexDirection: 'row', 
    backgroundColor: '#f3f4f6', 
    borderRadius: 8, 
    padding: 2 
  },
  viewButton: { 
    flex: 1, 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  viewButtonActive: { 
    backgroundColor: '#3b82f6' 
  },
  viewButtonText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#6b7280' 
  },
  viewButtonTextActive: { 
    color: 'white' 
  },
  warning: { 
    backgroundColor: '#fee2e2', 
    padding: 12, 
    marginHorizontal: 20, 
    marginTop: 10, 
    borderRadius: 8 
  },
  warningText: { 
    color: '#dc2626', 
    fontSize: 14, 
    fontWeight: '500', 
    textAlign: 'center' 
  },
  content: { 
    flex: 1, 
    padding: 15 
  },
  fab: { 
    position: 'absolute', 
    bottom: 20, 
    right: 20, 
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
    position: 'absolute', 
    bottom: 20, 
    right: 90, 
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
  fabHidden: {
    display: 'none'
  },
  vacationMode: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  vacationModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e'
  },
  vacationCalculator: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  vacationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937'
  },
  vacationHint: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16
  },
  vacationDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 4
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    textAlign: 'center'
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#4b5563'
  },
  salaryInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16
  },
  calculateButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  },
  resultCard: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 8,
    marginTop: 16
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1e40af'
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  resultLabel: {
    fontSize: 16,
    color: '#4b5563'
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937'
  },
  resultLabelBold: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },
  resultValueBold: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669'
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#9ca3af',
    marginVertical: 12
  }
});