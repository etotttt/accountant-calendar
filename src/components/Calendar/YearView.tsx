// src/components/Calendar/YearView.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface YearViewProps {
    year: number;
    holidays: any;
    shortDays: any;
    tasks: any[];
    taxDeadlines: any;
    onDateClick: (date: Date) => void;
}

const YearView: React.FC<YearViewProps> = ({ year }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Годовой вид - {year}</Text>
            <Text style={styles.subtext}>Здесь будет календарь на весь год</Text>
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

export default YearView;