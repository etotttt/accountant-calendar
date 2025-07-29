// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import VacationCalculator from '../../src/components/Calculator/VacationCalculator';
import FABMenu from '../../src/components/FABMenu';
import WorkdayCalculatorModal from '../../src/components/Modals/WorkdayCalculatorModal';
import { useCalendarData } from '../../src/hooks/useCalendarData';
import IndustrialCalendarScreen from '../../src/screens/IndustrialCalendarScreen';
import PersonalCalendarScreen from '../../src/screens/PersonalCalendarScreen';

type CalendarMode = 'personal' | 'industrial';
type ToolMode = 'none' | 'vacation' | 'workdays';

export default function TabIndexScreen() {
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('personal');
  const [toolMode, setToolMode] = useState<ToolMode>('none');
  const [currentDate] = useState(new Date());
  const { holidays } = useCalendarData(currentDate.getFullYear());
  
  // Состояния для калькулятора отпускных
  const [vacationStart, setVacationStart] = useState<Date | null>(null);
  const [vacationEnd, setVacationEnd] = useState<Date | null>(null);
  const [showWorkdayCalculator, setShowWorkdayCalculator] = useState(false);

  const handleVacationPress = () => {
    // Если мы в производственном календаре, переключаемся на личный
    if (calendarMode === 'industrial') {
      setCalendarMode('personal');
    }
    setToolMode('vacation');
    setVacationStart(null);
    setVacationEnd(null);
  };

  const handleCalculatorPress = () => {
    setShowWorkdayCalculator(true);
  };

  const handleVacationDateChange = (start: Date | null, end: Date | null) => {
    setVacationStart(start);
    setVacationEnd(end);
  };

  const cancelTool = () => {
    setToolMode('none');
    setVacationStart(null);
    setVacationEnd(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar spacing for Android */}
      {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }} />}
      
      {/* Mode Switcher - добавлен отступ сверху */}
      <View style={styles.modeSwitcherWrapper}>
        <View style={styles.modeSwitcher}>
          <TouchableOpacity 
            style={[
              styles.modeButton, 
              calendarMode === 'personal' && styles.modeButtonActive
            ]}
            onPress={() => setCalendarMode('personal')}
            disabled={toolMode === 'vacation'}
          >
            <Ionicons 
              name="person" 
              size={20} 
              color={calendarMode === 'personal' ? '#fff' : '#6b7280'} 
            />
            <Text style={[
              styles.modeButtonText,
              calendarMode === 'personal' && styles.modeButtonTextActive
            ]}>
              Личный
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.modeButton, 
              calendarMode === 'industrial' && styles.modeButtonActive,
              toolMode === 'vacation' && styles.modeButtonDisabled
            ]}
            onPress={() => setCalendarMode('industrial')}
            disabled={toolMode === 'vacation'}
          >
            <Ionicons 
              name="business" 
              size={20} 
              color={calendarMode === 'industrial' ? '#fff' : '#6b7280'} 
            />
            <Text style={[
              styles.modeButtonText,
              calendarMode === 'industrial' && styles.modeButtonTextActive
            ]}>
              Производственный
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tool Mode Indicator */}
      {toolMode === 'vacation' && (
        <View style={styles.toolModeIndicator}>
          <View style={styles.toolModeContent}>
            <Ionicons 
              name="cash-outline" 
              size={20} 
              color="#92400e" 
            />
            <Text style={styles.toolModeText}>
              Расчет отпускных
            </Text>
          </View>
          <TouchableOpacity onPress={cancelTool} style={styles.closeButton}>
            <Ionicons name="close-circle" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content with conditional layout */}
      <View style={styles.content}>
        {toolMode === 'vacation' ? (
          // Режим расчета отпускных - разделенный интерфейс
          <View style={styles.vacationModeContainer}>
            {/* Калькулятор отпускных вверху */}
            <View style={styles.vacationCalculatorWrapper}>
              <VacationCalculator
                vacationStart={vacationStart}
                vacationEnd={vacationEnd}
                holidays={holidays}
                onReset={() => {
                  setVacationStart(null);
                  setVacationEnd(null);
                }}
                onDateChange={handleVacationDateChange}
              />
            </View>
            
            {/* Разделитель */}
            <View style={styles.separator} />
            
            {/* Календарь внизу для выбора дат */}
            <View style={styles.calendarWrapper}>
              <PersonalCalendarScreen 
                disabled={false}
                vacationMode={true}
                vacationStart={vacationStart}
                vacationEnd={vacationEnd}
                onVacationDateSelect={handleVacationDateChange}
              />
            </View>
          </View>
        ) : (
          // Обычный режим
          <>
            {calendarMode === 'personal' ? (
              <PersonalCalendarScreen 
                disabled={false}
                vacationMode={false}
                vacationStart={vacationStart}
                vacationEnd={vacationEnd}
                onVacationDateSelect={handleVacationDateChange}
              />
            ) : (
              <IndustrialCalendarScreen 
                disabled={false}
              />
            )}
          </>
        )}
      </View>

      {/* FAB Menu - Always visible */}
      <FABMenu
        onVacationPress={handleVacationPress}
        onCalculatorPress={handleCalculatorPress}
        isVisible={true}
      />

      {/* Workday Calculator Modal */}
      <WorkdayCalculatorModal
        visible={showWorkdayCalculator}
        onClose={() => setShowWorkdayCalculator(false)}
        holidays={holidays}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  modeSwitcherWrapper: {
    paddingTop: Platform.OS === 'ios' ? 10 : 5, // Добавлен отступ сверху
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 100,
  },
  modeSwitcher: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  modeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  modeButtonDisabled: {
    opacity: 0.5,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  toolModeIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  toolModeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  vacationModeContainer: {
    flex: 1,
  },
  vacationCalculatorWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#f3f4f6',
  },
  separator: {
    height: 16,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  calendarWrapper: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
});