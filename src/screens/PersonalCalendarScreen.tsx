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

  const currentPeriodText = view === 'year'
    ? currentDate.getFullYear().toString()
    : currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

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
        currentPeriod={currentPeriodText}
        view={view}
        onViewChange={setView}
        onNavigatePrev={() => view === 'year' ? changeYear(-1) : changeMonth(-1)}
        onNavigateNext={() => view === 'year' ? changeYear(1) : changeMonth(1)}
      />

      {/* Layers Control */}
      <View style={styles.layersControl}>
        <TouchableOpacity 
          style={styles.layersButton}
          onPress={() => setShowLayers(!showLayers)}
        >
          <Ionicons name="layers" size={20} color="#6b7280" />
          <Text style={styles.layersButtonText}>Слои</Text>
          <Ionicons 
            name={showLayers ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#6b7280" 
          />
        </TouchableOpacity>
      </View>

      {showLayers && (
        <View style={styles.layersPanel}>
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
          <TouchableOpacity style={styles.addLayerButton}>
            <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
            <Text style={styles.addLayerText}>Добавить слой</Text>
          </TouchableOpacity>
        </View>
      )}

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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  layersControl: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  layersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  layersButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    flex: 1,
  },
  layersPanel: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  addLayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addLayerText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
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
});