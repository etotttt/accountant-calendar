// src/components/Calendar/MonthView.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MonthViewProps {
    currentDate: Date;
    holidays: any;
    shortDays: any;
    tasks: any[];
    taxDeadlines: any;
    onDateClick: (date: Date) => void;
    selectedDate: Date | null;
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate }) => {
    const monthName = currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Месячный вид</Text>
            <Text style={styles.subtext}>{monthName}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
});

export default MonthView;