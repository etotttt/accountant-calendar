// src/components/Modals/DateDetailsModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Task } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  date: Date | null;
  tasks: Task[];
  onTasksUpdate: (tasks: Task[]) => void;
  holidays: Record<string, string>;
  shortDays: Record<string, string>;
  taxDeadlines: Record<string, { title: string }>;
}

const DateDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  date,
  tasks,
  onTasksUpdate,
  holidays,
  shortDays,
  taxDeadlines,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!date) return null;

  const dateStr = date.toISOString().split('T')[0];
  const dayTasks = tasks.filter((t) => t.date === dateStr);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      completed: false,
      date: dateStr,
    };
    onTasksUpdate([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: number) => {
    onTasksUpdate(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (id: number) => {
    Alert.alert('Удалить задачу?', '', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => onTasksUpdate(tasks.filter((t) => t.id !== id)),
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {date.toLocaleDateString('ru-RU')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={16}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Add task */}
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              placeholder="Новая задача"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              onSubmitEditing={addTask}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addTask}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Task list */}
          <ScrollView style={styles.list}>
            {/* Праздник */}
            {holidays[dateStr] && (
              <View style={styles.row}>
                <Ionicons name="calendar" size={20} color="#dc2626" />
                <Text style={styles.holidayText}>{holidays[dateStr]}</Text>
              </View>
            )}
            {/* Короткий день */}
            {shortDays[dateStr] && (
              <View style={styles.row}>
                <Ionicons name="time" size={20} color="#d97706" />
                <Text style={styles.shortText}>{shortDays[dateStr]}</Text>
              </View>
            )}
            {/* Дедлайн */}
            {taxDeadlines[dateStr] && (
              <View style={styles.row}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text style={styles.deadlineText}>{taxDeadlines[dateStr].title}</Text>
              </View>
            )}

            {dayTasks.length ? (
              dayTasks.map((task) => (
                <View key={task.id} style={styles.taskRow}>
                  <TouchableOpacity onPress={() => toggleTask(task.id)}>
                    <Ionicons
                      name={task.completed ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={task.completed ? '#10b981' : '#9ca3af'}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.taskText,
                      task.completed && styles.taskCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteTask(task.id)}
                    hitSlop={16}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>Нет задач на этот день</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '600' },
  addRow: { flexDirection: 'row', marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { marginBottom: 8 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  taskText: { flex: 1, fontSize: 16 },
  taskCompleted: { textDecorationLine: 'line-through', color: '#9ca3af' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  holidayText: { marginLeft: 8, color: '#dc2626', fontWeight: '500' },
  shortText: { marginLeft: 8, color: '#d97706', fontWeight: '500' },
  deadlineText: { marginLeft: 8, color: '#dc2626', fontWeight: '500' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 20 },
});

export default DateDetailsModal;