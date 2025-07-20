import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Task } from '../types';

export const useTasks = (): [Task[], (newTasks: Task[]) => void] => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const savedTasks = await AsyncStorage.getItem('accountantTasks');
            if (savedTasks) {
                setTasks(JSON.parse(savedTasks));
            }
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