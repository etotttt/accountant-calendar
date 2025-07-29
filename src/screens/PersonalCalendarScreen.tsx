// src/screens/PersonalCalendarScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DayView from '../components/Calendar/DayView';
import MonthView from '../components/Calendar/MonthView';
import YearView from '../components/Calendar/YearView';
import DateDetailsModal from '../components/Modals/DateDetailsModal';
import SafeHeader from '../components/SafeHeader';
import { taxDeadlines } from '../constants/calendarData';
import { useCalendarData } from '../hooks/useCalendarData';
import { useTasks } from '../hooks/useTasks';
import { ViewType } from '../types';

interface Layer {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  type: 'system' | 'custom';
}

interface PersonalCalendarScreenProps {
  disabled?: boolean;
  vacationMode?: boolean;
  vacationStart?: Date | null;
  vacationEnd?: Date | null;
  onVacationDateSelect?: (start: Date | null, end: Date | null) => void;
}

export default function PersonalCalendarScreen({
  disabled,
  vacationMode,
  vacationStart,
  vacationEnd,
  onVacationDateSelect,
}: PersonalCalendarScreenProps) {
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [tasks, updateTasks] = useTasks();
  const [showDateDetails, setShowDateDetails] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const { holidays, shortDays } = useCalendarData(currentDate.getFullYear());

  // Слои календаря
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'holidays', name: 'Праздники РФ', color: '#dc2626', enabled: true, type: 'system' },
    { id: 'tasks', name: 'Мои задачи', color: '#3b82f6', enabled: true, type: 'system' },
    { id: 'deadlines', name: 'Налоговые сроки', color: '#f59e0b', enabled: false, type: 'system' },
  ]);

  const handleDateClick = (date: Date) => {
    if (vacationMode && onVacationDateSelect) {
      if (!vacationStart) {
        onVacationDateSelect(date, null);
      } else if (!vacationEnd) {
        if (date >= vacationStart) {
          onVacationDateSelect(vacationStart, date);
        } else {
          onVacationDateSelect(date, vacationStart);
        }
      } else {
        onVacationDateSelect(date, null);
      }
    } else if (!disabled) {
      setSelectedDate(date);
      if (view === 'year') {
        setCurrentDate(date);
        setView('month');
      } else {
        setShowDateDetails(true);
      }
    }
  };

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    if (newView === 'day' && selectedDate) {
      setCurrentDate(selectedDate);
    } else if (newView === 'day') {
      setCurrentDate(new Date());
    }
  };

  const handleGoToDay = (date: Date) => {
    setCurrentDate(date);
    setView('day');
  };

  const toggleLayer = (layerId: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer
    ));
  };

  const changeMonth = (amount: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
  };

  const changeYear = (amount: number) => {
    setCurrentDate(new Date(currentDate.getFullYear() + amount, currentDate.getMonth(), 1));
  };

  const changeDay = (amount: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + amount);
    setCurrentDate(newDate);
  };

  const navigate = (direction: 'prev' | 'next') => {
    const amount = direction === 'prev' ? -1 : 1;
    if (view === 'year') {
      changeYear(amount);
    } else if (view === 'month') {
      changeMonth(amount);
    } else {
      changeDay(amount);
    }
  };

  const getCurrentPeriodText = () => {
    if (view === 'year') {
      return currentDate.getFullYear().toString();
    } else if (view === 'month') {
      return currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    } else {
      return currentDate.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  // Фильтрация данных в зависимости от активных слоев
  const getFilteredData = () => {
    const holidaysLayer = layers.find(l => l.id === 'holidays');
    const tasksLayer = layers.find(l => l.id === 'tasks');
    const deadlinesLayer = layers.find(l => l.id === 'deadlines');

    return {
      holidays: holidaysLayer?.enabled ? holidays : {},
      shortDays: holidaysLayer?.enabled ? shortDays : {},
      tasks: tasksLayer?.enabled ? tasks : [],
      taxDeadlines: deadlinesLayer?.enabled ? taxDeadlines : {},
    };
  };

  const filteredData = getFilteredData();

  return (
    <View style={styles.container}>
      <SafeHeader
        title="Личный календарь"
        currentPeriod={getCurrentPeriodText()}
        view={view}
        onViewChange={handleViewChange}
        onNavigatePrev={() => navigate('prev')}
        onNavigateNext={() => navigate('next')}
      />

      {view === 'day' ? (
        <DayView
          currentDate={currentDate}
          holidays={filteredData.holidays}
          shortDays={filteredData.shortDays}
          tasks={tasks}
          taxDeadlines={filteredData.taxDeadlines}
          onTasksUpdate={updateTasks}
        />
      ) : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.calendarContainer}>
            {view === 'year' ? (
              <YearView
                year={currentDate.getFullYear()}
                holidays={filteredData.holidays}
                shortDays={filteredData.shortDays}
                tasks={filteredData.tasks}
                taxDeadlines={filteredData.taxDeadlines}
                onDateClick={handleDateClick}
              />
            ) : (
              <MonthView
                currentDate={currentDate}
                holidays={filteredData.holidays}
                shortDays={filteredData.shortDays}
                tasks={filteredData.tasks}
                taxDeadlines={filteredData.taxDeadlines}
                onDateClick={handleDateClick}
                selectedDate={selectedDate}
                vacationStart={vacationStart}
                vacationEnd={vacationEnd}
                calculatorMode={vacationMode ? 'vacation' : 'none'}
              />
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      {/* Floating Layers Button - не показываем в режиме дня */}
      {view !== 'day' && (
        <TouchableOpacity 
          style={styles.floatingLayersButton}
          onPress={() => setShowLayers(!showLayers)}
          activeOpacity={0.8}
        >
          <Ionicons name="layers" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Layers Panel */}
      {showLayers && view !== 'day' && (
        <View style={styles.layersPanel}>
          <View style={styles.layersPanelHeader}>
            <Text style={styles.layersPanelTitle}>Слои календаря</Text>
            <TouchableOpacity onPress={() => setShowLayers(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {layers.map(layer => (
            <View key={layer.id} style={styles.layerItem}>
              <View style={styles.layerInfo}>
                <View style={[styles.layerColor, { backgroundColor: layer.color }]} />
                <Text style={styles.layerName}>{layer.name}</Text>
              </View>
              <Switch
                value={layer.enabled}
                onValueChange={() => toggleLayer(layer.id)}
                trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                thumbColor={layer.enabled ? '#3b82f6' : '#9ca3af'}
              />
            </View>
          ))}
        </View>
      )}

      {/* Date Details Modal */}
      <DateDetailsModal
        visible={showDateDetails}
        onClose={() => setShowDateDetails(false)}
        date={selectedDate}
        holidays={filteredData.holidays}
        shortDays={filteredData.shortDays}
        tasks={tasks}
        taxDeadlines={filteredData.taxDeadlines}
        onTasksUpdate={updateTasks}
        onGoToDay={handleGoToDay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  calendarContainer: {
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 100,
  },
  floatingLayersButton: {
    position: 'absolute',
    left: 16,
    bottom: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  layersPanel: {
    position: 'absolute',
    left: 16,
    bottom: 80,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  layersPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  layersPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  layerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  layerColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  layerName: {
    fontSize: 14,
    color: '#374151',
  },
});