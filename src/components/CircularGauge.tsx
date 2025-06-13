import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useTheme } from '../contexts/ThemeContext';

interface CircularGaugeProps {
  value: number;
  label: string;
  type: 'accelerometer' | 'gyroscope';
  size: number;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  label,
  type,
  size,
}) => {
  const { theme } = useTheme();

  // Define ranges based on sensor type
  const ranges = {
    accelerometer: {
      min: -15,
      max: 15,
      warning: 10,
    },
    gyroscope: {
      min: -500,
      max: 500,
      warning: 300,
    },
  };

  const range = ranges[type];
  const normalizedValue = Math.abs(value);
  const percentage = (normalizedValue / Math.abs(range.max)) * 100;

  // Determine color based on value
  const getColor = () => {
    if (normalizedValue >= range.warning) {
      return theme.colors.error;
    } else if (normalizedValue >= range.warning * 0.5) {
      return theme.colors.warning;
    }
    return theme.colors.success;
  };

  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={size}
        width={8}
        fill={percentage}
        tintColor={getColor()}
        backgroundColor={theme.colors.border}
        rotation={0}
        lineCap="round"
      >
        {() => (
          <View style={styles.valueContainer}>
            <Text style={[styles.value, { color: theme.colors.text }]}>
              {value.toFixed(1)}
            </Text>
            <Text style={[styles.unit, { color: theme.colors.textSecondary }]}>
              {type === 'accelerometer' ? 'm/s²' : '°/s'}
            </Text>
          </View>
        )}
      </AnimatedCircularProgress>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  valueContainer: {
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  unit: {
    fontSize: 12,
    marginTop: 2,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
}); 