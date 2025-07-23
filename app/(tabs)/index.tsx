// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  SafeAreaView,
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
      {/* Mode Switcher */}
      <View style={styles.modeSwitcher}>
        <TouchableOpacity 
          style={[
            styles.modeButton, 
            calendarMode === 'personal' && styles.modeButtonActive
          ]}
          onPress={() => setCalendarMode('personal')}
          disabled={toolMode !== 'none'}
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
            calendarMode === 'industrial' && styles.modeButtonActive
          ]}
          onPress={() => setCalendarMode('industrial')}
          disabled={toolMode !== 'none'}
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

      {/* Tool Mode Indicator */}
      {toolMode !== 'none' && (
        <View style={styles.toolModeIndicator}>
          <View style={styles.toolModeContent}>
            <Ionicons 
              name={toolMode === 'vacation' ? 'cash-outline' : 'calculator'} 
              size={20} 
              color="#92400e" 
            />
            <Text style={styles.toolModeText}>
              {toolMode === 'vacation' ? 'Расчет отпускных' : 'Калькулятор дней'}
            </Text>
          </View>
          <TouchableOpacity onPress={cancelTool} style={styles.closeButton}>
            <Ionicons name="close-circle" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Vacation Calculator Overlay */}
      {toolMode === 'vacation' && (
        <View style={styles.toolOverlay}>
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
      )}

      {/* Main Content */}
      <View style={[
        styles.content,
        toolMode !== 'none' && styles.contentDisabled
      ]}>
        {calendarMode === 'personal' ? (
          <PersonalCalendarScreen 
            disabled={toolMode !== 'none'}
            vacationMode={toolMode === 'vacation'}
            vacationStart={vacationStart}
            vacationEnd={vacationEnd}
            onVacationDateSelect={handleVacationDateChange}
          />
        ) : (
          <IndustrialCalendarScreen 
            disabled={toolMode !== 'none'}
          />
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
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 100,
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
  contentDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  toolOverlay: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
  },
});