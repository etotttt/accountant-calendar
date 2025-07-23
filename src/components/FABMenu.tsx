// src/components/FABMenu.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface FABMenuProps {
  onVacationPress: () => void;
  onCalculatorPress: () => void;
  isVisible: boolean;
}

const FABMenu: React.FC<FABMenuProps> = ({
  onVacationPress,
  onCalculatorPress,
  isVisible
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  // Сброс состояния при скрытии компонента
  useEffect(() => {
    if (!isVisible) {
      // Сбрасываем состояние и анимации
      setExpanded(false);
      animation.setValue(0);
      buttonScale.setValue(0);
    }
  }, [isVisible, animation, buttonScale]);

  // Анимация появления/скрытия кнопок
  useEffect(() => {
    Animated.timing(buttonScale, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [expanded, buttonScale]);

  const toggleMenu = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true
    }).start();
    setExpanded(!expanded);
  };

  const handleButtonPress = (action: () => void) => {
    // Сначала выполняем действие
    action();
    
    // Затем закрываем меню
    setExpanded(false);
    Animated.parallel([
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(buttonScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg']
        })
      }
    ]
  };

  if (!isVisible) return null;

  const buttons = [
    { 
      icon: 'calculator', 
      action: onCalculatorPress, 
      offset: 140, 
      label: 'Калькулятор дней', 
      color: styles.fabSecondary 
    },
    { 
      icon: 'cash-outline', 
      action: onVacationPress, 
      offset: 70, 
      label: 'Расчет отпускных', 
      color: styles.fabVacation 
    }
  ];

  return (
    <View style={styles.container} pointerEvents="box-none">
      {expanded && (
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={toggleMenu} 
        />
      )}

      {/* Кнопки - рендерим всегда, но управляем видимостью через opacity и scale */}
      {buttons.map((item) => (
        <Animated.View
          key={item.icon}
          style={[
            styles.button,
            {
              transform: [
                { 
                  scale: buttonScale 
                },
                { 
                  translateY: buttonScale.interpolate({ 
                    inputRange: [0, 1], 
                    outputRange: [0, -item.offset] 
                  }) 
                }
              ],
              opacity: buttonScale
            }
          ]}
        >
          {expanded && (
            <Animated.View 
              style={[
                styles.label,
                { opacity: buttonScale }
              ]}
            >
              <Text style={styles.labelText}>{item.label}</Text>
            </Animated.View>
          )}
          <TouchableOpacity
            style={[styles.fab, item.color]}
            onPress={() => expanded ? handleButtonPress(item.action) : null}
            disabled={!expanded}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.8}
          >
            <Ionicons name={item.icon as any} size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* Главная кнопка */}
      <TouchableOpacity 
        style={[styles.fab, styles.fabMain]} 
        onPress={toggleMenu}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.8}
      >
        <Animated.View style={rotation}>
          <Ionicons name="add" size={28} color="white" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    zIndex: 999
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  button: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    alignItems: 'flex-end'
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  fabMain: { backgroundColor: '#6366f1' },
  fabVacation: { backgroundColor: '#10b981' },
  fabSecondary: { backgroundColor: '#3b82f6' },
  label: {
    position: 'absolute',
    right: 70,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    minWidth: 120
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937'
  }
});

export default FABMenu;