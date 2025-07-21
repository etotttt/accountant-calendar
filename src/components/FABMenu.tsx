// src/components/FABMenu.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  // Сброс анимации при скрытии меню
  useEffect(() => {
    if (!isVisible && expanded) {
      setExpanded(false);
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [isVisible]);

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

  const handleVacationPress = () => {
    // Сначала закрываем меню
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setExpanded(false);
      onVacationPress();
    });
  };

  const handleCalculatorPress = () => {
    // Сначала закрываем меню
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setExpanded(false);
      onCalculatorPress();
    });
  };

  const vacationButtonStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70]
        })
      }
    ],
    opacity: animation
  };

  const calculatorButtonStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140]
        })
      }
    ],
    opacity: animation
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

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Фон при раскрытом меню */}
      {expanded && (
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}
      
      {/* Кнопка калькулятора */}
      <Animated.View 
        style={[styles.button, calculatorButtonStyle]}
        pointerEvents={expanded ? 'auto' : 'none'}
      >
        <View style={styles.buttonContent}>
          {expanded && (
            <View style={styles.label}>
              <Text style={styles.labelText}>Калькулятор дней</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.fab, styles.fabSecondary]}
            onPress={handleCalculatorPress}
            activeOpacity={0.8}
          >
            <Ionicons name="calculator" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Кнопка отпускных */}
      <Animated.View 
        style={[styles.button, vacationButtonStyle]}
        pointerEvents={expanded ? 'auto' : 'none'}
      >
        <View style={styles.buttonContent}>
          {expanded && (
            <View style={styles.label}>
              <Text style={styles.labelText}>Расчет отпускных</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.fab, styles.fabVacation]}
            onPress={handleVacationPress}
            activeOpacity={0.8}
          >
            <Ionicons name="cash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Главная кнопка */}
      <TouchableOpacity
        style={[styles.fab, styles.fabMain]}
        onPress={toggleMenu}
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
    alignItems: 'flex-end'
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
    right: 0
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center'
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
  fabMain: {
    backgroundColor: '#6366f1'
  },
  fabVacation: {
    backgroundColor: '#10b981'
  },
  fabSecondary: {
    backgroundColor: '#3b82f6'
  },
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