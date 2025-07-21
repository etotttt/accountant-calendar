// src/screens/CalendarScreen.tsx
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

// Компоненты
import VacationCalculator from '../components/Calculator/VacationCalculator';
import MonthView from '../components/Calendar/MonthView';
import StatsPanel from '../components/Calendar/StatsPanel';
import YearView from '../components/Calendar/YearView';
import FABMenu from '../components/FABMenu';
import DateDetailsModal from '../components/Modals/DateDetailsModal';
import WorkdayCalculatorModal from '../components/Modals/WorkdayCalculatorModal';
import SafeHeader from '../components/SafeHeader';

// Хуки и утилиты
import { taxDeadlines } from '../constants/calendarData';
import { useCalendarData } from '../hooks/useCalendarData';
import { useTasks } from '../hooks/useTasks';

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

  const handleDateClick = (date: Date) => {
    if (calculatorMode === 'vacation') {
      if (!vacationStart) {
        setVacationStart(date);
      } else if (!vacationEnd) {
        if (date >= vacationStart) {
          setVacationEnd(date);
        } else {
          // Меняем местами даты
          setVacationEnd(vacationStart);
          setVacationStart(date);
        }
      } else {
        // Сброс выбора
        setVacationStart(date);
        setVacationEnd(null);
      }
    } else {
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
  };

  const cancelVacationCalculator = () => {
    setCalculatorMode('none');
    setVacationStart(null);
    setVacationEnd(null);
  };

  const currentPeriodText = view === 'year' 
    ? currentDate.getFullYear().toString()
    : currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeHeader
          title="Производственный календарь"
          currentPeriod={currentPeriodText}
          view={view}
          onViewChange={setView}
          onNavigatePrev={() => view === 'year' ? changeYear(-1) : changeMonth(-1)}
          onNavigateNext={() => view === 'year' ? changeYear(1) : changeMonth(1)}
          calculatorMode={calculatorMode}
          onCancelCalculator={cancelVacationCalculator}
        />

        {!isDataAvailable && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Данные для {currentDate.getFullYear()} года отсутствуют
            </Text>
          </View>
        )}

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Калькулятор отпускных */}
          {calculatorMode === 'vacation' && (
            <VacationCalculator
              vacationStart={vacationStart}
              vacationEnd={vacationEnd}
              holidays={holidays}
              onReset={() => {
                setVacationStart(null);
                setVacationEnd(null);
              }}
            />
          )}

          {/* Календарь */}
          <View style={styles.calendarContainer}>
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
          </View>
          
          {/* Статистика */}
          <StatsPanel 
            year={currentDate.getFullYear()} 
            month={view === 'month' ? currentDate.getMonth() : undefined}
            holidays={holidays} 
            shortDays={shortDays} 
          />
          
          {/* Дополнительный отступ для FAB */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* FAB меню */}
        <FABMenu
          onVacationPress={startVacationCalculator}
          onCalculatorPress={() => setShowCalculator(true)}
          isVisible={calculatorMode === 'none'}
        />

        {/* Модальные окна */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f3f4f6' 
  },
  warning: { 
    backgroundColor: '#fee2e2', 
    padding: 12, 
    marginHorizontal: 16, 
    marginTop: 8, 
    borderRadius: 8 
  },
  warningText: { 
    color: '#dc2626', 
    fontSize: 14, 
    fontWeight: '500', 
    textAlign: 'center' 
  },
  content: { 
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 8
  },
  calendarContainer: {
    marginBottom: 16
  },
  bottomSpacer: {
    height: 100 // Пространство для FAB кнопок
  }
});