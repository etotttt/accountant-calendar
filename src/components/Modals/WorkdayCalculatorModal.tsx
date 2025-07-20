// src/components/Modals/WorkdayCalculatorModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<{
    workDays: number;
    totalDays: number;
  } | null>(null);

  const calculate = () => {
    if (!startDate || !endDate) {
      Alert.alert('Ошибка', 'Выберите обе даты');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      Alert.alert('Ошибка', 'Начальная дата должна быть раньше конечной');
      return;
    }
    let workDays = 0;
    let totalDays = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      totalDays++;
      if (d.getDay() !== 0 && d.getDay() !== 6 && !holidays[d.toISOString().split('T')[0]]) {
        workDays++;
      }
    }
    setResult({ workDays, totalDays });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.calculatorModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Калькулятор рабочих дней</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.calculatorBody}>
            <Text style={styles.inputLabel}>Начальная дата:</Text>
            <TextInput
              style={styles.dateInput}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="ГГГГ-ММ-ДД"
            />

            <Text style={styles.inputLabel}>Конечная дата:</Text>
            <TextInput
              style={styles.dateInput}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="ГГГГ-ММ-ДД"
            />

            <TouchableOpacity style={styles.calculateButton} onPress={calculate}>
              <Text style={styles.calculateButtonText}>Рассчитать</Text>
            </TouchableOpacity>

            {result && (
              <View style={styles.resultCard}>
                <Text style={styles.resultText}>
                  Всего дней: <Text style={styles.bold}>{result.totalDays}</Text>
                </Text>
                <Text style={styles.resultText}>
                  Рабочих дней: <Text style={styles.bold}>{result.workDays}</Text>
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  closeButton: { padding: 5 },
  calculatorBody: { padding: 20 },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  calculateButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
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
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#1e40af',
    marginBottom: 5,
  },
  bold: { fontWeight: 'bold' },
});