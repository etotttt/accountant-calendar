// Убедитесь, что этот файл сохранен в кодировке UTF-8 для корректного отображения кириллицы.
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    TextInput,
    Alert,
    Platform,
    Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// --- ТИПЫ ДАННЫХ ---
interface HolidayData {
    [date: string]: string;
}

interface ShortDayData {
    [date: string]: string;
}

interface CalendarYearData {
    holidays: HolidayData;
    shortDays: ShortDayData;
}

interface StaticData {
    [year: number]: CalendarYearData;
}

interface Task {
    id: number;
    date: string;
    title: string;
    completed: boolean;
}

interface TaxDeadline {
    title: string;
    type: string;
    priority: 'high' | 'medium' | 'critical';
}

interface TaxDeadlines {
    [date: string]: TaxDeadline;
}


// --- ДАННЫЕ И УТИЛИТЫ ---
const staticCalendarData: StaticData = {
    2024: {
        holidays: { '2024-01-01': 'Новогодние каникулы', '2024-01-02': 'Новогодние каникулы', '2024-01-03': 'Новогодние каникулы', '2024-01-04': 'Новогодние каникулы', '2024-01-05': 'Новогодние каникулы', '2024-01-06': 'Новогодние каникулы', '2024-01-07': 'Рождество Христово', '2024-01-08': 'Новогодние каникулы', '2024-02-23': 'День защитника Отечества', '2024-03-08': 'Международный женский день', '2024-04-29': 'Выходной (перенос с 27.04)', '2024-04-30': 'Выходной (перенос с 02.11)', '2024-05-01': 'Праздник Весны и Труда', '2024-05-09': 'День Победы', '2024-05-10': 'Выходной (перенос с 06.01)', '2024-06-12': 'День России', '2024-11-04': 'День народного единства', '2024-12-30': 'Выходной (перенос с 28.12)', '2024-12-31': 'Выходной (перенос с 07.01)' },
        shortDays: { '2024-02-22': 'Предпраздничный день', '2024-03-07': 'Предпраздничный день', '2024-04-27': 'Рабочая суббота', '2024-05-08': 'Предпраздничный день', '2024-06-11': 'Предпраздничный день', '2024-11-02': 'Рабочая суббота', '2024-12-28': 'Рабочая суббота' }
    },
    2025: {
        holidays: { '2025-01-01': 'Новогодние каникулы', '2025-01-02': 'Новогодние каникулы', '2025-01-03': 'Новогодние каникулы', '2025-01-04': 'Новогодние каникулы', '2025-01-05': 'Новогодние каникулы', '2025-01-06': 'Новогодние каникулы', '2025-01-07': 'Рождество Христово', '2025-01-08': 'Новогодние каникулы', '2025-02-24': 'Выходной (перенос с 23.02)', '2025-03-10': 'Выходной (перенос с 08.03)', '2025-05-01': 'Праздник Весны и Труда', '2025-05-09': 'День Победы', '2025-06-12': 'День России', '2025-11-04': 'День народного единства' },
        shortDays: { '2025-02-22': 'Предпраздничный день', '2025-03-07': 'Предпраздничный день', '2025-04-30': 'Предпраздничный день', '2025-05-08': 'Предпраздничный день', '2025-06-11': 'Предпраздничный день', '2025-11-03': 'Предпраздничный день', '2025-12-31': 'Предпраздничный день' }
    },
    2026: {
        holidays: { '2026-01-01': 'Новогодние каникулы', '2026-01-02': 'Новогодние каникулы', '2026-01-03': 'Новогодние каникулы', '2026-01-04': 'Новогодние каникулы', '2026-01-05': 'Новогодние каникулы', '2026-01-06': 'Новогодние каникулы', '2026-01-07': 'Рождество Христово', '2026-01-08': 'Новогодние каникулы', '2026-02-23': 'День защитника Отечества', '2026-03-09': 'Выходной (перенос с 08.03)', '2026-05-01': 'Праздник Весны и Труда', '2026-05-11': 'Выходной (перенос с 09.05)', '2026-06-12': 'День России', '2026-11-04': 'День народного единства' },
        shortDays: { '2026-02-21': 'Предпраздничный день', '2026-03-07': 'Предпраздничный день', '2026-04-30': 'Предпраздничный день', '2026-05-08': 'Предпраздничный день', '2026-06-11': 'Предпраздничный день', '2026-11-03': 'Предпраздничный день', '2026-12-31': 'Предпраздничный день' }
    }
};

const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const isWeekend = (date: Date): boolean => date.getDay() === 0 || date.getDay() === 6;

// --- ХУКИ ---
const useCalendarData = (year: number) => useMemo(() => {
    const data = staticCalendarData[year] || { holidays: {}, shortDays: {} };
    return { ...data, isDataAvailable: !!staticCalendarData[year] };
}, [year]);

const useTasks = (): [Task[], (newTasks: Task[]) => void] => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const savedTasks = await AsyncStorage.getItem('accountantTasks');
            if (savedTasks) setTasks(JSON.parse(savedTasks));
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const updateTasks = async (newTasks: Task[]) => {
        try {
            setTasks(newTasks);
            await AsyncStorage.setItem('accountantTasks', JSON.stringify(newTasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    };

    return [tasks, updateTasks];
};

// --- КОМПОНЕНТЫ ---

type YearViewProps = {
    year: number;
    holidays: HolidayData;
    shortDays: ShortDayData;
    tasks: Task[];
    taxDeadlines: TaxDeadlines;
    onDateClick: (date: Date) => void;
};

const YearView: React.FC<YearViewProps> = ({ year, holidays, shortDays, tasks, taxDeadlines, onDateClick }) => {
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
        <View style={styles.yearGrid}>
            {months.map(month => (
                <MonthMiniCard
                    key={month}
                    month={month}
                    year={year}
                    holidays={holidays}
                    shortDays={shortDays}
                    tasks={tasks}
                    taxDeadlines={taxDeadlines}
                    onDateClick={onDateClick}
                />
            ))}
        </View>
    );
};

type MonthMiniCardProps = {
    month: number;
} & YearViewProps;

const MonthMiniCard: React.FC<MonthMiniCardProps> = ({ month, year, holidays, shortDays, tasks, taxDeadlines, onDateClick }) => {
    const monthName = new Date(year, month).toLocaleString('ru-RU', { month: 'long' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const startingDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

    return (
        <View style={styles.monthMiniCard}>
            <Text style={styles.monthMiniTitle}>{monthName}</Text>
            <View style={styles.weekDaysRow}>
                {['П', 'В', 'С', 'Ч', 'П', 'С', 'В'].map((d, i) => (
                    <Text key={i} style={styles.weekDayMini}>{d}</Text>
                ))}
            </View>
            <View style={styles.daysGrid}>
                {Array.from({ length: startingDay }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dayMini} />
                ))}
                {days.map(date => {
                    const dateStr = formatDate(date);
                    const isHol = holidays[dateStr];
                    const isWknd = isWeekend(date);
                    const hasTask = tasks.some(t => t.date === dateStr);
                    const hasDeadline = taxDeadlines[dateStr];

                    return (
                        <TouchableOpacity
                            key={dateStr}
                            style={[
                                styles.dayMini,
                                (isHol || isWknd) && styles.dayMiniHoliday,
                                shortDays[dateStr] && styles.dayMiniShort,
                            ]}
                            onPress={() => onDateClick(date)}
                        >
                            <Text style={[
                                styles.dayMiniText,
                                (isHol || isWknd) && styles.dayMiniTextHoliday
                            ]}>
                                {date.getDate()}
                            </Text>
                            {(hasTask || hasDeadline) && (
                                <View style={styles.dayIndicators}>
                                    {hasTask && <View style={styles.taskDot} />}
                                    {hasDeadline && <View style={styles.deadlineDot} />}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

type MonthViewProps = {
    currentDate: Date;
    holidays: HolidayData;
    shortDays: ShortDayData;
    tasks: Task[];
    taxDeadlines: TaxDeadlines;
    onDateClick: (date: Date) => void;
    selectedDate: Date | null;
};

const MonthView: React.FC<MonthViewProps> = ({ currentDate, holidays, shortDays, tasks, taxDeadlines, onDateClick, selectedDate }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const startingDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days = [];
    for (let i = 0; i < startingDay; i++) {
        days.push({ date: new Date(year, month, i - startingDay + 1), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return (
        <View style={styles.monthView}>
            <View style={styles.weekDaysFullRow}>
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => (
                    <Text key={i} style={styles.weekDayFull}>{d}</Text>
                ))}
            </View>

            <View style={styles.monthGrid}>
                {days.map(({ date, isCurrentMonth }, i) => {
                    const dateStr = formatDate(date);
                    const isHol = holidays[dateStr];
                    const isWknd = isWeekend(date);
                    const isShort = shortDays[dateStr];
                    const dayTasks = tasks.filter(t => t.date === dateStr);
                    const dayDeadline = taxDeadlines[dateStr];
                    const isSelected = selectedDate && formatDate(selectedDate) === dateStr;

                    return (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.dayFull,
                                !isCurrentMonth && styles.dayFullOtherMonth,
                                (isHol || isWknd) && isCurrentMonth && styles.dayFullHoliday,
                                isShort && isCurrentMonth && styles.dayFullShort,
                                isSelected && styles.dayFullSelected,
                            ]}
                            onPress={() => onDateClick(date)}
                        >
                            <Text style={[
                                styles.dayFullNumber,
                                !isCurrentMonth && styles.dayFullNumberOther,
                                (isHol || isWknd) && isCurrentMonth && styles.dayFullNumberHoliday,
                            ]}>
                                {date.getDate()}
                            </Text>

                            {isCurrentMonth && (
                                <View style={styles.dayContent}>
                                    {isHol && <Text style={styles.holidayName} numberOfLines={1}>{isHol}</Text>}
                                    {isShort && <Text style={styles.shortDayText} numberOfLines={1}>{isShort}</Text>}
                                    {dayDeadline && (
                                        <View style={styles.deadlineTag}>
                                            <Text style={styles.deadlineTagText} numberOfLines={1}>
                                                {dayDeadline.title}
                                            </Text>
                                        </View>
                                    )}
                                    {dayTasks.map(task => (
                                        <View key={task.id} style={[styles.taskTag, task.completed && styles.taskTagCompleted]}>
                                            <Text style={[styles.taskTagText, task.completed && styles.taskTagTextCompleted]} numberOfLines={1}>
                                                {task.title}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

type DateDetailsModalProps = {
    visible: boolean;
    onClose: () => void;
    date: Date | null;
    holidays: HolidayData;
    shortDays: ShortDayData;
    tasks: Task[];
    taxDeadlines: TaxDeadlines;
    onTasksUpdate: (tasks: Task[]) => void;
};

const DateDetailsModal: React.FC<DateDetailsModalProps> = ({ visible, onClose, date, holidays, shortDays, tasks, taxDeadlines, onTasksUpdate }) => {
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    if (!date) return null;

    const dateStr = formatDate(date);
    const dayHoliday = holidays[dateStr];
    const dayShort = shortDays[dateStr];
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const dayDeadline = taxDeadlines[dateStr];

    const addTask = () => {
        if (newTaskTitle.trim()) {
            const newTask: Task = {
                id: Date.now(),
                date: dateStr,
                title: newTaskTitle.trim(),
                completed: false
            };
            onTasksUpdate([...tasks, newTask]);
            setNewTaskTitle('');
            setShowAddTask(false);
        }
    };

    const toggleTask = (taskId: number) => {
        const updated = tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        onTasksUpdate(updated);
    };

    const deleteTask = (taskId: number) => {
        Alert.alert(
            'Удалить задачу?',
            'Это действие нельзя отменить',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: () => onTasksUpdate(tasks.filter(t => t.id !== taskId))
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {date.toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {dayHoliday && <View style={styles.holidayInfo}><Ionicons name="calendar" size={20} color="#dc2626" /><Text style={styles.holidayInfoText}>{dayHoliday}</Text></View>}
                        {dayShort && <View style={styles.shortInfo}><Ionicons name="time" size={20} color="#d97706" /><Text style={styles.shortInfoText}>{dayShort}</Text></View>}
                        {dayDeadline && <View style={styles.deadlineInfo}><Ionicons name="alert-circle" size={20} color="#dc2626" /><Text style={styles.deadlineInfoText}>{dayDeadline.title}</Text></View>}

                        <View style={styles.tasksSection}>
                            <View style={styles.tasksSectionHeader}>
                                <Text style={styles.tasksSectionTitle}>Задачи</Text>
                                <TouchableOpacity onPress={() => setShowAddTask(!showAddTask)} style={styles.addTaskButton}><Ionicons name="add" size={24} color="white" /></TouchableOpacity>
                            </View>

                            {showAddTask && (
                                <View style={styles.addTaskForm}>
                                    <TextInput style={styles.taskInput} value={newTaskTitle} onChangeText={setNewTaskTitle} placeholder="Новая задача..." autoFocus />
                                    <View style={styles.addTaskActions}>
                                        <TouchableOpacity style={[styles.taskButton, styles.taskButtonSave]} onPress={addTask}><Text style={styles.taskButtonText}>Добавить</Text></TouchableOpacity>
                                        <TouchableOpacity style={[styles.taskButton, styles.taskButtonCancel]} onPress={() => { setShowAddTask(false); setNewTaskTitle(''); }}><Text style={styles.taskButtonText}>Отмена</Text></TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {dayTasks.length > 0 ? (
                                <View style={styles.tasksList}>
                                    {dayTasks.map(task => (
                                        <View key={task.id} style={styles.taskItem}>
                                            <TouchableOpacity onPress={() => toggleTask(task.id)} style={styles.taskCheckbox}><Ionicons name={task.completed ? "checkbox" : "square-outline"} size={24} color={task.completed ? "#10b981" : "#d1d5db"} /></TouchableOpacity>
                                            <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
                                            <TouchableOpacity onPress={() => deleteTask(task.id)} style={styles.taskDelete}><Ionicons name="trash-outline" size={20} color="#ef4444" /></TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noTasks}>Нет задач</Text>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

type WorkdayCalculatorModalProps = {
    visible: boolean;
    onClose: () => void;
    holidays: HolidayData;
};

const WorkdayCalculatorModal: React.FC<WorkdayCalculatorModalProps> = ({ visible, onClose, holidays }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [result, setResult] = useState<{ workDays: number; totalDays: number } | null>(null);

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
        let workDays = 0, totalDays = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            totalDays++;
            if (!isWeekend(d) && !holidays[formatDate(d)]) {
                workDays++;
            }
        }
        setResult({ workDays, totalDays });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.calculatorModal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Калькулятор рабочих дней</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
                    </View>
                    <View style={styles.calculatorBody}>
                        <Text style={styles.inputLabel}>Начальная дата:</Text>
                        <TextInput style={styles.dateInput} value={startDate} onChangeText={setStartDate} placeholder="ГГГГ-ММ-ДД" />
                        <Text style={styles.inputLabel}>Конечная дата:</Text>
                        <TextInput style={styles.dateInput} value={endDate} onChangeText={setEndDate} placeholder="ГГГГ-ММ-ДД" />
                        <TouchableOpacity style={styles.calculateButton} onPress={calculate}><Text style={styles.calculateButtonText}>Рассчитать</Text></TouchableOpacity>
                        {result && (
                            <View style={styles.resultCard}>
                                <Text style={styles.resultText}>Всего дней: <Text style={styles.resultBold}>{result.totalDays}</Text></Text>
                                <Text style={styles.resultText}>Рабочих дней: <Text style={styles.resultBold}>{result.workDays}</Text></Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ ---
const AccountantCalendar: React.FC = () => {
    const [view, setView] = useState<'year' | 'month'>('year');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [tasks, updateTasks] = useTasks();
    const [showDateDetails, setShowDateDetails] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const { holidays, shortDays, isDataAvailable } = useCalendarData(currentDate.getFullYear());

    const taxDeadlines: TaxDeadlines = useMemo(() => ({
        '2025-01-27': { title: 'Страховые взносы за декабрь 2024', type: 'insurance', priority: 'high' },
        '2025-03-25': { title: 'Декларация по налогу на прибыль за 2024', type: 'profit', priority: 'critical' },
        '2025-04-28': { title: 'Декларация по УСН за 2024 (Организации)', type: 'usn', priority: 'critical' },
    }), []);

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
        const stats = { total: { calendar: 0, work: 0, holiday: 0 } };
        for (let m = 0; m < 12; m++) {
            const daysInMonth = new Date(year, m + 1, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, m, d);
                const dateStr = formatDate(date);
                stats.total.calendar++;
                if (isWeekend(date) || holidays[dateStr]) {
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
                <View style={styles.titleRow}><Ionicons name="calendar" size={32} color="#3b82f6" /><Text style={styles.title}>Производственный календарь</Text></View>
                <View style={styles.navigation}>
                    <TouchableOpacity style={styles.navButton} onPress={() => view === 'year' ? changeYear(-1) : changeMonth(-1)}><Ionicons name="chevron-back" size={24} color="#333" /></TouchableOpacity>
                    <Text style={styles.currentPeriod}>{view === 'year' ? currentDate.getFullYear() : currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</Text>
                    <TouchableOpacity style={styles.navButton} onPress={() => view === 'year' ? changeYear(1) : changeMonth(1)}><Ionicons name="chevron-forward" size={24} color="#333" /></TouchableOpacity>
                </View>
                <View style={styles.viewSwitch}>
                    <TouchableOpacity style={[styles.viewButton, view === 'month' && styles.viewButtonActive]} onPress={() => setView('month')}><Text style={[styles.viewButtonText, view === 'month' && styles.viewButtonTextActive]}>Месяц</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.viewButton, view === 'year' && styles.viewButtonActive]} onPress={() => setView('year')}><Text style={[styles.viewButtonText, view === 'year' && styles.viewButtonTextActive]}>Год</Text></TouchableOpacity>
                </View>
            </View>

            {!isDataAvailable && <View style={styles.warning}><Text style={styles.warningText}>Данные для {currentDate.getFullYear()} года отсутствуют</Text></View>}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {view === 'year' ?
                    <YearView year={currentDate.getFullYear()} holidays={holidays} shortDays={shortDays} tasks={tasks} taxDeadlines={taxDeadlines} onDateClick={handleDateClick} /> :
                    <MonthView currentDate={currentDate} holidays={holidays} shortDays={shortDays} tasks={tasks} taxDeadlines={taxDeadlines} onDateClick={handleDateClick} selectedDate={selectedDate} />
                }
                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Статистика {currentDate.getFullYear()} года</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}><Text style={styles.statValue}>{yearStats.total.calendar}</Text><Text style={styles.statLabel}>Всего дней</Text></View>
                        <View style={styles.statItem}><Text style={styles.statValue}>{yearStats.total.work}</Text><Text style={styles.statLabel}>Рабочих</Text></View>
                        <View style={styles.statItem}><Text style={styles.statValue}>{yearStats.total.holiday}</Text><Text style={styles.statLabel}>Выходных</Text></View>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setShowCalculator(true)}><Ionicons name="calculator" size={24} color="white" /></TouchableOpacity>

            <DateDetailsModal visible={showDateDetails} onClose={() => setShowDateDetails(false)} date={selectedDate} holidays={holidays} shortDays={shortDays} tasks={tasks} taxDeadlines={taxDeadlines} onTasksUpdate={updateTasks} />
            <WorkdayCalculatorModal visible={showCalculator} onClose={() => setShowCalculator(false)} holidays={holidays} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { backgroundColor: 'white', paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 15, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 5 },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    title: { fontSize: 24, fontWeight: 'bold', marginLeft: 10, color: '#1f2937' },
    navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    navButton: { padding: 10 },
    currentPeriod: { fontSize: 18, fontWeight: '600', marginHorizontal: 20, minWidth: 150, textAlign: 'center', textTransform: 'capitalize' },
    viewSwitch: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 2 },
    viewButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center' },
    viewButtonActive: { backgroundColor: '#3b82f6' },
    viewButtonText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
    viewButtonTextActive: { color: 'white' },
    warning: { backgroundColor: '#fee2e2', padding: 12, marginHorizontal: 20, marginTop: 10, borderRadius: 8 },
    warningText: { color: '#dc2626', fontSize: 14, fontWeight: '500', textAlign: 'center' },
    content: { flex: 1, padding: 15 },
    yearGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    monthMiniCard: { width: (screenWidth - 40) / 2 - 5, backgroundColor: 'white', borderRadius: 8, padding: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    monthMiniTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center', textTransform: 'capitalize' },
    weekDaysRow: { flexDirection: 'row', marginBottom: 4 },
    weekDayMini: { flex: 1, textAlign: 'center', fontSize: 10, color: '#6b7280' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayMini: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
    dayMiniHoliday: { backgroundColor: '#fee2e2', borderRadius: 4 },
    dayMiniShort: { backgroundColor: '#fef3c7', borderRadius: 4 },
    dayMiniText: { fontSize: 11, color: '#374151' },
    dayMiniTextHoliday: { color: '#dc2626', fontWeight: '600' },
    dayIndicators: { position: 'absolute', bottom: 1, flexDirection: 'row', gap: 2 },
    taskDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#3b82f6' },
    deadlineDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#dc2626' },
    monthView: { backgroundColor: 'white', borderRadius: 8, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
    weekDaysFullRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 10, marginBottom: 10 },
    weekDayFull: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#6b7280' },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayFull: { width: '14.28%', minHeight: 80, borderWidth: 1, borderColor: '#e5e7eb', padding: 4, marginBottom: -1, marginRight: -1 },
    dayFullOtherMonth: { backgroundColor: '#f9fafb' },
    dayFullHoliday: { backgroundColor: '#fee2e2' },
    dayFullShort: { backgroundColor: '#fef3c7' },
    dayFullSelected: { borderColor: '#3b82f6', borderWidth: 2 },
    dayFullNumber: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
    dayFullNumberOther: { color: '#9ca3af' },
    dayFullNumberHoliday: { color: '#dc2626', fontWeight: '600' },
    dayContent: { flex: 1 },
    holidayName: { fontSize: 9, color: '#dc2626', marginBottom: 2 },
    shortDayText: { fontSize: 9, color: '#d97706', marginBottom: 2 },
    deadlineTag: { backgroundColor: '#fee2e2', borderRadius: 2, padding: 2, marginBottom: 2 },
    deadlineTagText: { fontSize: 9, color: '#dc2626' },
    taskTag: { backgroundColor: '#dbeafe', borderRadius: 2, padding: 2, marginBottom: 2 },
    taskTagCompleted: { backgroundColor: '#f3f4f6' },
    taskTagText: { fontSize: 9, color: '#3b82f6' },
    taskTagTextCompleted: { textDecorationLine: 'line-through', color: '#9ca3af' },
    statsCard: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginTop: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
    statsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1f2937' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
    fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: Platform.OS === 'ios' ? 34 : 0 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    modalTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
    closeButton: { padding: 5 },
    modalBody: { padding: 20 },
    holidayInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 10 },
    holidayInfoText: { marginLeft: 10, fontSize: 16, color: '#dc2626', fontWeight: '500' },
    shortInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', padding: 12, borderRadius: 8, marginBottom: 10 },
    shortInfoText: { marginLeft: 10, fontSize: 16, color: '#d97706', fontWeight: '500' },
    deadlineInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 10 },
    deadlineInfoText: { marginLeft: 10, fontSize: 16, color: '#dc2626', fontWeight: '500' },
    tasksSection: { marginTop: 20 },
    tasksSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    tasksSectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
    addTaskButton: { backgroundColor: '#3b82f6', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    addTaskForm: { marginBottom: 15 },
    taskInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 10 },
    addTaskActions: { flexDirection: 'row', gap: 10 },
    taskButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    taskButtonSave: { backgroundColor: '#3b82f6' },
    taskButtonCancel: { backgroundColor: '#6b7280' },
    taskButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    tasksList: { gap: 10 },
    taskItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, gap: 12 },
    taskCheckbox: { padding: 2 },
    taskTitle: { flex: 1, fontSize: 16, color: '#1f2937' },
    taskTitleCompleted: { textDecorationLine: 'line-through', color: '#9ca3af' },
    taskDelete: { padding: 5 },
    noTasks: { fontSize: 16, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
    calculatorModal: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
    calculatorBody: { padding: 20 },
    inputLabel: { fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 },
    dateInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
    calculateButton: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    calculateButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    resultCard: { backgroundColor: '#eff6ff', padding: 20, borderRadius: 8, marginTop: 20, alignItems: 'center' },
    resultText: { fontSize: 16, color: '#1e40af', marginBottom: 5 },
    resultBold: { fontWeight: 'bold', fontSize: 18 },
});

export default AccountantCalendar;
