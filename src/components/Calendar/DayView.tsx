// src/components/Calendar/DayView.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { HolidayData, ShortDayData, Task, TaxDeadlines } from '../../types';
import { formatDate } from '../../utils/dateUtils';

const { height: screenHeight } = Dimensions.get('window');
const HOUR_HEIGHT = 60;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface DayViewProps {
  currentDate: Date;
  holidays: HolidayData;
  shortDays: ShortDayData;
  tasks: Task[];
  taxDeadlines: TaxDeadlines;
  onTasksUpdate: (tasks: Task[]) => void;
}

interface TimeSlot {
  hour: number;
  minute: number;
}

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  holidays,
  shortDays,
  tasks,
  taxDeadlines,
  onTasksUpdate
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState<Date>(new Date());
  const [taskEndTime, setTaskEndTime] = useState<Date>(new Date());
  const [pickingEndTime, setPickingEndTime] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Автоматическая прокрутка к текущему времени при монтировании
  useEffect(() => {
    const currentHour = new Date().getHours();
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: (currentHour - 1) * HOUR_HEIGHT,
        animated: true
      });
    }, 100);
  }, []);

  const dateStr = formatDate(currentDate);
  const dayTasks = tasks.filter(t => t.date === dateStr);
  const isToday = formatDate(new Date()) === dateStr;
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

  // Группировка задач по времени
  const tasksByTime = dayTasks.reduce((acc, task) => {
    if (task.startTime) {
      const hour = parseInt(task.startTime.split(':')[0]);
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(task);
    }
    return acc;
  }, {} as Record<number, Task[]>);

  const handleTimeSlotPress = (hour: number, minute: number = 0) => {
    setSelectedTimeSlot({ hour, minute });
    const startTime = new Date(currentDate);
    startTime.setHours(hour, minute, 0, 0);
    setTaskStartTime(startTime);
    
    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, minute, 0, 0);
    setTaskEndTime(endTime);
    
    setNewTaskTitle('');
    setEditingTask(null);
    setShowAddTask(true);
  };

  const handleTaskPress = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    
    if (task.startTime) {
      const [startHour, startMinute] = task.startTime.split(':').map(Number);
      const startTime = new Date(currentDate);
      startTime.setHours(startHour, startMinute, 0, 0);
      setTaskStartTime(startTime);
    }
    
    if (task.endTime) {
      const [endHour, endMinute] = task.endTime.split(':').map(Number);
      const endTime = new Date(currentDate);
      endTime.setHours(endHour, endMinute, 0, 0);
      setTaskEndTime(endTime);
    }
    
    setShowAddTask(true);
  };

  const saveTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Ошибка', 'Введите название задачи');
      return;
    }

    const startTimeStr = `${taskStartTime.getHours().toString().padStart(2, '0')}:${taskStartTime.getMinutes().toString().padStart(2, '0')}`;
    const endTimeStr = `${taskEndTime.getHours().toString().padStart(2, '0')}:${taskEndTime.getMinutes().toString().padStart(2, '0')}`;

    if (editingTask) {
      // Обновление существующей задачи
      const updatedTasks = tasks.map(t => 
        t.id === editingTask.id 
          ? { ...t, title: newTaskTitle.trim(), startTime: startTimeStr, endTime: endTimeStr }
          : t
      );
      onTasksUpdate(updatedTasks);
    } else {
      // Создание новой задачи
      const newTask: Task = {
        id: Date.now(),
        title: newTaskTitle.trim(),
        completed: false,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr
      };
      onTasksUpdate([...tasks, newTask]);
    }
    
    setShowAddTask(false);
    setEditingTask(null);
  };

  const deleteTask = () => {
    if (editingTask) {
      Alert.alert(
        'Удалить задачу?',
        'Это действие нельзя отменить',
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: () => {
              onTasksUpdate(tasks.filter(t => t.id !== editingTask.id));
              setShowAddTask(false);
              setEditingTask(null);
            }
          }
        ]
      );
    }
  };

  const toggleTaskComplete = (taskId: number) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onTasksUpdate(updatedTasks);
  };

  const renderTask = (task: Task, hour: number) => {
    const startMinute = task.startTime ? parseInt(task.startTime.split(':')[1]) : 0;
    const topOffset = (startMinute / 60) * HOUR_HEIGHT;
    
    let duration = 1; // По умолчанию 1 час
    if (task.startTime && task.endTime) {
      const [startH, startM] = task.startTime.split(':').map(Number);
      const [endH, endM] = task.endTime.split(':').map(Number);
      duration = (endH * 60 + endM - startH * 60 - startM) / 60;
    }
    
    const height = Math.max(duration * HOUR_HEIGHT - 4, 30); // Минимальная высота

    return (
      <TouchableOpacity
        key={task.id}
        style={[
          styles.task,
          { top: topOffset, height },
          task.completed && styles.taskCompleted
        ]}
        onPress={() => handleTaskPress(task)}
        activeOpacity={0.8}
      >
        <View style={styles.taskContent}>
          <TouchableOpacity
            style={styles.taskCheckbox}
            onPress={() => toggleTaskComplete(task.id)}
          >
            <Ionicons
              name={task.completed ? 'checkbox' : 'square-outline'}
              size={18}
              color={task.completed ? '#10b981' : '#3b82f6'}
            />
          </TouchableOpacity>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={styles.taskTime}>
              {task.startTime} - {task.endTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCurrentTimeLine = () => {
    if (!isToday) return null;
    
    const topOffset = (currentHour + currentMinute / 60) * HOUR_HEIGHT;
    
    return (
      <View style={[styles.currentTimeLine, { top: topOffset }]}>
        <View style={styles.currentTimeDot} />
        <View style={styles.currentTimeLineBar} />
      </View>
    );
  };

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Информация о дне */}
        <View style={styles.dayHeader}>
          <Text style={styles.dayDate}>
            {currentDate.toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
          {holidays[dateStr] && (
            <View style={styles.holidayBadge}>
              <Text style={styles.holidayText}>{holidays[dateStr]}</Text>
            </View>
          )}
          {shortDays[dateStr] && (
            <View style={styles.shortDayBadge}>
              <Text style={styles.shortDayText}>{shortDays[dateStr]}</Text>
            </View>
          )}
        </View>

        {/* Часовая сетка */}
        <View style={styles.timeGrid}>
          {renderCurrentTimeLine()}
          
          {HOURS.map(hour => (
            <View key={hour} style={styles.hourRow}>
              <View style={styles.hourLabel}>
                <Text style={styles.hourText}>
                  {hour.toString().padStart(2, '0')}:00
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.hourSlot}
                onPress={() => handleTimeSlotPress(hour)}
                activeOpacity={0.6}
              >
                <View style={styles.hourLine} />
                {/* Задачи в этот час */}
                {tasksByTime[hour]?.map(task => renderTask(task, hour))}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Модальное окно добавления/редактирования задачи */}
      <Modal
        visible={showAddTask}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddTask(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTask ? 'Редактировать задачу' : 'Новая задача'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddTask(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.taskInput}
              placeholder="Название задачи"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />

            <View style={styles.timeRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => {
                  setPickingEndTime(false);
                  setShowTimePicker(true);
                }}
              >
                <Ionicons name="time-outline" size={20} color="#3b82f6" />
                <Text style={styles.timeButtonText}>
                  Начало: {taskStartTime.toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => {
                  setPickingEndTime(true);
                  setShowTimePicker(true);
                }}
              >
                <Ionicons name="time-outline" size={20} color="#3b82f6" />
                <Text style={styles.timeButtonText}>
                  Конец: {taskEndTime.toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              {editingTask && (
                <TouchableOpacity style={styles.deleteButton} onPress={deleteTask}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  <Text style={styles.deleteButtonText}>Удалить</Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setShowAddTask(false)}
                >
                  <Text style={styles.cancelButtonText}>Отмена</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
                  <Text style={styles.saveButtonText}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Time Picker */}
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        date={pickingEndTime ? taskEndTime : taskStartTime}
        onConfirm={(date) => {
          if (pickingEndTime) {
            setTaskEndTime(date);
          } else {
            setTaskStartTime(date);
            // Автоматически устанавливаем время окончания на час позже
            const endTime = new Date(date);
            endTime.setHours(date.getHours() + 1);
            setTaskEndTime(endTime);
          }
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
        locale="ru_RU"
        is24Hour={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  dayHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  holidayBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  holidayText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  shortDayBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  shortDayText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
  },
  timeGrid: {
    position: 'relative',
  },
  hourRow: {
    flexDirection: 'row',
    height: HOUR_HEIGHT,
  },
  hourLabel: {
    width: 60,
    paddingRight: 8,
    alignItems: 'flex-end',
    paddingTop: -8,
  },
  hourText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  hourSlot: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    position: 'relative',
  },
  hourLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 16,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  task: {
    position: 'absolute',
    left: 4,
    right: 20,
    backgroundColor: '#dbeafe',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    borderRadius: 4,
    padding: 4,
    minHeight: 30,
  },
  taskCompleted: {
    backgroundColor: '#f3f4f6',
    borderLeftColor: '#9ca3af',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskCheckbox: {
    marginRight: 6,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  taskTime: {
    fontSize: 11,
    color: '#6b7280',
  },
  currentTimeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  currentTimeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginLeft: 54,
  },
  currentTimeLineBar: {
    flex: 1,
    height: 2,
    backgroundColor: '#ef4444',
    marginRight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: screenHeight * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  timeButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  modalActions: {
    gap: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 8,
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#3b82f6',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default DayView;