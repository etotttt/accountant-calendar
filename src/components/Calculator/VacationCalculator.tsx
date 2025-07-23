// src/components/Calculator/VacationCalculator.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { HolidayData } from '../../types';
import { calculateVacationDays } from '../../utils/vacationCalculator';

interface VacationCalculatorProps {
  vacationStart: Date | null;
  vacationEnd: Date | null;
  holidays: HolidayData;
  onReset: () => void;
  onDateChange?: (start: Date | null, end: Date | null) => void;
}

const VacationCalculator: React.FC<VacationCalculatorProps> = ({
  vacationStart,
  vacationEnd,
  holidays,
  onReset,
  onDateChange
}) => {
  const [salary, setSalary] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    if (vacationStart && vacationEnd && salary) {
      calculate();
    }
  }, [vacationStart, vacationEnd]);

  const calculate = () => {
    if (!vacationStart || !vacationEnd || !salary) return;
    
    const avgSalary = parseFloat(salary.replace(/[^\d.]/g, ''));
    if (isNaN(avgSalary)) return;

    const calcResult = calculateVacationDays(vacationStart, vacationEnd, avgSalary, holidays);
    setResult(calcResult);
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers) {
      return parseInt(numbers).toLocaleString('ru-RU');
    }
    return '';
  };

  const handleSalaryChange = (text: string) => {
    const formatted = formatCurrency(text);
    setSalary(formatted);
    
    if (vacationStart && vacationEnd && formatted) {
      const avgSalary = parseFloat(formatted.replace(/[^\d.]/g, ''));
      if (!isNaN(avgSalary)) {
        const calcResult = calculateVacationDays(vacationStart, vacationEnd, avgSalary, holidays);
        setResult(calcResult);
      }
    }
  };

  const handleStartDateConfirm = (date: Date) => {
    if (vacationEnd && date > vacationEnd) {
      Alert.alert('Ошибка', 'Дата начала не может быть позже даты окончания');
      setShowStartPicker(false);
      return;
    }
    onDateChange?.(date, vacationEnd);
    setShowStartPicker(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    if (vacationStart && date < vacationStart) {
      Alert.alert('Ошибка', 'Дата окончания не может быть раньше даты начала');
      setShowEndPicker(false);
      return;
    }
    onDateChange?.(vacationStart, date);
    setShowEndPicker(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="cash-outline" size={24} color="#10b981" />
            <Text style={styles.title}>Расчет отпускных</Text>
          </View>
          <TouchableOpacity onPress={onReset} style={styles.resetButton}>
            <Ionicons name="refresh" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Выберите даты отпуска или нажмите на календарь
        </Text>

        {/* Даты отпуска */}
        <View style={styles.datesContainer}>
          <TouchableOpacity 
            style={styles.dateBlock}
            onPress={() => setShowStartPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateLabel}>Начало отпуска</Text>
            <View style={[
              styles.dateValue,
              vacationStart && styles.dateValueSelected
            ]}>
              <Ionicons 
                name="calendar-outline" 
                size={16} 
                color={vacationStart ? '#10b981' : '#9ca3af'} 
              />
              <Text style={[
                styles.dateText,
                !vacationStart && styles.datePlaceholder
              ]}>
                {vacationStart 
                  ? vacationStart.toLocaleDateString('ru-RU') 
                  : 'Выберите дату'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dateSeparator}>
            <Ionicons name="arrow-forward" size={20} color="#9ca3af" />
          </View>

          <TouchableOpacity 
            style={styles.dateBlock}
            onPress={() => setShowEndPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateLabel}>Конец отпуска</Text>
            <View style={[
              styles.dateValue,
              vacationEnd && styles.dateValueSelected
            ]}>
              <Ionicons 
                name="calendar-outline" 
                size={16} 
                color={vacationEnd ? '#10b981' : '#9ca3af'} 
              />
              <Text style={[
                styles.dateText,
                !vacationEnd && styles.datePlaceholder
              ]}>
                {vacationEnd 
                  ? vacationEnd.toLocaleDateString('ru-RU') 
                  : 'Выберите дату'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Ввод зарплаты */}
        <View style={styles.salarySection}>
          <Text style={styles.inputLabel}>
            Средняя зарплата за 12 месяцев
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.salaryInput}
              value={salary}
              onChangeText={handleSalaryChange}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.currencySymbol}>₽</Text>
          </View>
        </View>

        {/* Результаты расчета */}
        {result && (
          <View style={[styles.resultCard, isKeyboardVisible && styles.resultCardCompact]}>
            <Text style={styles.resultTitle}>Результат расчета</Text>
            
            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Дней отпуска</Text>
                <Text style={styles.resultValue}>{result.vacationDays}</Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Календарных дней</Text>
                <Text style={styles.resultValue}>{result.calendarDays}</Text>
              </View>
            </View>

            <View style={styles.resultDivider} />

            <View style={styles.calculationDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Среднедневной заработок</Text>
                <Text style={styles.detailValue}>{result.dailyRate.toFixed(2)} ₽</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Начислено</Text>
                <Text style={styles.detailValue}>{result.gross.toFixed(2)} ₽</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>НДФЛ (13%)</Text>
                <Text style={styles.detailValueRed}>−{result.ndfl.toFixed(2)} ₽</Text>
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>К выплате</Text>
              <Text style={styles.totalValue}>{result.net.toFixed(2)} ₽</Text>
            </View>
          </View>
        )}
      </View>

      {/* Date Picker Modals */}
      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={() => setShowStartPicker(false)}
        date={vacationStart || new Date()}
        minimumDate={new Date()}
        locale="ru_RU"
        cancelTextIOS="Отмена"
        confirmTextIOS="Выбрать"
        headerTextIOS="Выберите дату начала отпуска"
      />

      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={() => setShowEndPicker(false)}
        date={vacationEnd || vacationStart || new Date()}
        minimumDate={vacationStart || new Date()}
        locale="ru_RU"
        cancelTextIOS="Отмена"
        confirmTextIOS="Выбрать"
        headerTextIOS="Выберите дату окончания отпуска"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  resetButton: {
    padding: 4
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16
  },
  datesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  dateBlock: {
    flex: 1
  },
  dateSeparator: {
    paddingHorizontal: 8,
    paddingTop: 20
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6
  },
  dateValue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  dateValueSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981'
  },
  dateText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500'
  },
  datePlaceholder: {
    color: '#9ca3af'
  },
  salarySection: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16
  },
  salaryInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    paddingVertical: 12,
    textAlign: 'right'
  },
  currencySymbol: {
    fontSize: 20,
    color: '#6b7280',
    marginLeft: 8
  },
  resultCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16
  },
  resultCardCompact: {
    padding: 12
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12
  },
  resultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12
  },
  resultItem: {
    alignItems: 'center'
  },
  resultLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 12
  },
  calculationDetails: {
    gap: 8
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: 14,
    color: '#4b5563'
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937'
  },
  detailValueRed: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669'
  }
});

export default VacationCalculator;