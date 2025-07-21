// src/components/SafeHeader.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeHeaderProps {
  title: string;
  currentPeriod: string;
  view: 'year' | 'month';
  onViewChange: (view: 'year' | 'month') => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  calculatorMode?: string;
  onCancelCalculator?: () => void;
}

const SafeHeader: React.FC<SafeHeaderProps> = ({
  title,
  currentPeriod,
  view,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  calculatorMode,
  onCancelCalculator
}) => {
  const insets = useSafeAreaInsets();
  
  // Динамический padding для разных устройств
  const paddingTop = Platform.select({
    ios: Math.max(insets.top, 20),
    android: StatusBar.currentHeight || 20
  });

  return (
    <View style={[styles.header, { paddingTop }]}>
      <View style={styles.titleContainer}>
        <Ionicons name="calendar" size={28} color="#3b82f6" />
        <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
          {title}
        </Text>
      </View>
      
      {calculatorMode === 'vacation' && (
        <View style={styles.modeIndicator}>
          <Text style={styles.modeText}>Режим расчета отпускных</Text>
          <TouchableOpacity onPress={onCancelCalculator} style={styles.closeButton}>
            <Ionicons name="close-circle" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.controls}>
        <View style={styles.navigation}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={onNavigatePrev}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.currentPeriod} numberOfLines={1}>
            {currentPeriod}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={onNavigateNext}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-forward" size={22} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[
              styles.viewButton, 
              view === 'month' && styles.viewButtonActive
            ]} 
            onPress={() => onViewChange('month')}
          >
            <Text style={[
              styles.viewButtonText, 
              view === 'month' && styles.viewButtonTextActive
            ]}>
              Месяц
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.viewButton, 
              view === 'year' && styles.viewButtonActive
            ]} 
            onPress={() => onViewChange('year')}
          >
            <Text style={[
              styles.viewButtonText, 
              view === 'year' && styles.viewButtonTextActive
            ]}>
              Год
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 40 // Пространство для длинного текста
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1f2937',
    flex: 1
  },
  modeIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e'
  },
  closeButton: {
    padding: 2
  },
  controls: {
    gap: 8
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navButton: {
    padding: 8
  },
  currentPeriod: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 100,
    textAlign: 'center',
    textTransform: 'capitalize'
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 2,
    alignSelf: 'center',
    width: '50%',
    minWidth: 120,
    maxWidth: 180
  },
  viewButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center'
  },
  viewButtonActive: {
    backgroundColor: '#3b82f6'
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280'
  },
  viewButtonTextActive: {
    color: 'white'
  }
});

export default SafeHeader;