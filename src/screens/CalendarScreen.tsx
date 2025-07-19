// src/screens/CalendarScreen.tsx
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Импорт компонентов
import YearView from '../components/Calendar/YearView';
import MonthView from '../components/Calendar/MonthView';
import DateDetailsModal from '../components/Modals/DateDetailsModal';
import WorkdayCalculatorModal from '../components/Modals/WorkdayCalculatorModal';

// Импорт хуков и утилит
import { useTasks } from '../hooks/useTasks';
import { useCalendarData } from '../hooks/useCalendarData';
import { formatDate } from '../utils/dateUtils';
import { taxDeadlines } from '../constants/calendarData';

// Типы
import { ViewType, YearStats } from '../types';

export default function CalendarScreen() {
    const [view, setView] = useState<ViewType>('year');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [tasks, updateTasks] = useTasks();
    const [showDateDetails, setShowDateDetails] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const { holidays, shortDays, isDataAvailable } = useCalendarData(currentDate.getFullYear());

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        if (view === 'year') {
            setCurrentDate(date);
            setView('month');
        } else {
            setShowDateDetails(true);
        }
    };

    const changeMonth = (amount: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
    };

    const changeYear = (amount: number) => {
        setCurrentDate(new Date(currentDate.getFullYear() + amount, currentDate.getMonth(), 1));
    };

    const yearStats = useMemo(() => {
        const year = currentDate.getFullYear();
        const stats: YearStats = { total: { calendar: 0, work: 0, holiday: 0 } };

        for (let m = 0; m < 12; m++) {
            const daysInMonth = new Date(year, m + 1, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, m, d);
                const dateStr = formatDate(date);
                stats.total.calendar++;

                if ((date.getDay() === 0 || date.getDay() === 6) || holidays[dateStr]) {
                    stats.total.holiday++;
                } else {
                    stats.total.work++;
                }
            }
        }

        return stats;
    }, [currentDate.getFullYear(), holidays]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="calendar" size={32} color="#3b82f6" />
                    <Text style={styles.title}>Производственный календарь</Text>
                </View>

                <View style={styles.navigation}>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => view === 'year' ? changeYear(-1) : changeMonth(-1)}
                    >
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>

                    <Text style={styles.currentPeriod}>
                        {view === 'year'
                            ? currentDate.getFullYear()
                            : currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                    </Text>

                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => view === 'year' ? changeYear(1) : changeMonth(1)}
                    >
                        <Ionicons name="chevron-forward" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.viewSwitch}>
                    <TouchableOpacity
                        style={[styles.viewButton, view === 'month' && styles.viewButtonActive]}
                        onPress={() => setView('month')}
                    >
                        <Text style={[styles.viewButtonText, view === 'month' && styles.viewButtonTextActive]}>
                            Месяц
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewButton, view === 'year' && styles.viewButtonActive]}
                        onPress={() => setView('year')}
                    >
                        <Text style={[styles.viewButtonText, view === 'year' && styles.viewButtonTextActive]}>
                            Год
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {!isDataAvailable && (
                <View style={styles.warning}>
                    <Text style={styles.warningText}>
                        Данные для {currentDate.getFullYear()} года отсутствуют
                    </Text>
                </View>
            )}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                    />
                )}

                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Статистика {currentDate.getFullYear()} года</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{yearStats.total.calendar}</Text>
                            <Text style={styles.statLabel}>Всего дней</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{yearStats.total.work}</Text>
                            <Text style={styles.statLabel}>Рабочих</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{yearStats.total.holiday}</Text>
                            <Text style={styles.statLabel}>Выходных</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowCalculator(true)}
            >
                <Ionicons name="calculator" size={24} color="white" />
            </TouchableOpacity>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6'
    },
    header: {
        backgroundColor: 'white',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 15,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#1f2937'
    },
    navigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15
    },
    navButton: {
        padding: 10
    },
    currentPeriod: {
        fontSize: 18,
        fontWeight: '600',
        marginHorizontal: 20,
        minWidth: 150,
        textAlign: 'center',
        textTransform: 'capitalize'
    },
    viewSwitch: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 2
    },
    viewButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center'
    },
    viewButtonActive: {
        backgroundColor: '#3b82f6'
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280'
    },
    viewButtonTextActive: {
        color: 'white'
    },
    warning: {
        backgroundColor: '#fee2e2',
        padding: 12,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 8
    },
    warningText: {
        color: '#dc2626',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center'
    },
    content: {
        flex: 1,
        padding: 15
    },
    statsCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1f2937'
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    statItem: {
        alignItems: 'center'
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937'
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8
    },
});