// src/components/Modals/WorkdayCalculatorModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface Props {
  visible: boolean;
  onClose: () => void;
  holidays: Record<string, string>;
}

export default function WorkdayCalculatorModal({
  visible,
  onClose,
  holidays,
}: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [result, setResult] = useState<{
    workDays: number;
    totalDays: number;
  } | null>(null);

  const calculate = () => {
    if (!startDate || !endDate) {
      Alert.alert('Ошибка', 'Выберите обе даты');
      return;
    }
    
    if (startDate > endDate) {
      Alert.alert('Ошибка', 'Начальная дата должна быть раньше конечной');
      return;
    }
    
    let workDays = 0;
    let totalDays = 0;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      totalDays++;
      const dateStr = d.toISOString().split('T')[0];
      if (d.getDay() !== 0 && d.getDay() !== 6 && !holidays[dateStr]) {
        workDays++;
      }
    }
    
    setResult({ workDays, totalDays });
  };

  const handleStartDateConfirm = (date: Date) => {
    setStartDate(date);
    setShowStartPicker(false);
    if (endDate && date > endDate) {
      setEndDate(null);
    }
  };

  const handleEndDateConfirm = (date: Date) => {
    if (startDate && date < startDate) {
      Alert.alert('Ошибка', 'Дата окончания не может быть раньше даты начала');
      setShowEndPicker(false);
      return;
    }
    setEndDate(date);
    setShowEndPicker(false);
  };

  const handleClose = () => {
    setStartDate(null);
    setEndDate(null);
    setResult(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.calculatorModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Калькулятор рабочих дней</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.calculatorBody}>
            <View style={styles.dateSection}>
              <Text style={styles.inputLabel}>Начальная дата:</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color={startDate ? '#3b82f6' : '#9ca3af'} 
                />
                <Text style={[
                  styles.dateButtonText,
                  !startDate && styles.placeholderText
                ]}>
                  {startDate 
                    ? startDate.toLocaleDateString('ru-RU')
                    : 'Выберите дату'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateSection}>
              <Text style={styles.inputLabel}>Конечная дата:</Text>
              <TouchableOpacity 
                style={[
                  styles.dateButton,
                  !startDate && styles.dateButtonDisabled
                ]}
                onPress={() => startDate && setShowEndPicker(true)}
                disabled={!startDate}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color={endDate ? '#3b82f6' : '#9ca3af'} 
                />
                <Text style={[
                  styles.dateButtonText,
                  !endDate && styles.placeholderText
                ]}>
                  {endDate 
                    ? endDate.toLocaleDateString('ru-RU')
                    : 'Выберите дату'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[
                styles.calculateButton,
                (!startDate || !endDate) && styles.calculateButtonDisabled
              ]} 
              onPress={calculate}
              disabled={!startDate || !endDate}
            >
              <Text style={styles.calculateButtonText}>Рассчитать</Text>
            </TouchableOpacity>

            {result && (
              <View style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Всего дней:</Text>
                  <Text style={styles.resultValue}>{result.totalDays}</Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Рабочих дней:</Text>
                  <Text style={styles.resultValuePrimary}>{result.workDays}</Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Выходных и праздничных:</Text>
                  <Text style={styles.resultValue}>{result.totalDays - result.workDays}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Date Picker Modals */}
      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={() => setShowStartPicker(false)}
        date={startDate || new Date()}
        locale="ru_RU"
        cancelTextIOS="Отмена"
        confirmTextIOS="Выбрать"
        headerTextIOS="Выберите начальную дату"
      />

      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={() => setShowEndPicker(false)}
        date={endDate || startDate || new Date()}
        minimumDate={startDate || undefined}
        locale="ru_RU"
        cancelTextIOS="Отмена"
        confirmTextIOS="Выбрать"
        headerTextIOS="Выберите конечную дату"
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculatorModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1f2937' 
  },
  closeButton: { 
    padding: 5 
  },
  calculatorBody: { 
    padding: 20 
  },
  dateSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  dateButtonDisabled: {
    backgroundColor: '#f9fafb',
    opacity: 0.6,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  calculateButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonDisabled: {
    backgroundColor: '#93c5fd',
    opacity: 0.6,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  resultValuePrimary: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 4,
  },
});