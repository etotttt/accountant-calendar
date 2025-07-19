// app/(tabs)/deadlines.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function DeadlinesScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Налоговые дедлайны</Text>
            <Text style={styles.subtitle}>Список важных дат</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
});