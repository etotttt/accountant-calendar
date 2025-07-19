// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#3b82f6',
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Календарь',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'calendar' : 'calendar-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="calculator"
                options={{
                    title: 'Расчеты',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'calculator' : 'calculator-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="deadlines"
                options={{
                    title: 'Дедлайны',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'alert-circle' : 'alert-circle-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}