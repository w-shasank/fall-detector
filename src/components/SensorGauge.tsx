import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ACCELEROMETER_RANGE, GYROSCOPE_RANGE } from '../constants/config';

interface SensorGaugeProps {
  value: number;
  label: string;
  type: 'accelerometer' | 'gyroscope';
  size?: number;
}

export const SensorGauge: React.FC<SensorGaugeProps> = ({
  value,
  label,
  type,
  size = 150,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const range = type === 'accelerometer' ? ACCELEROMETER_RANGE : GYROSCOPE_RANGE;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [value]);

  const getColor = (value: number) => {
    const normalizedValue = Math.abs(value) / Math.abs(range.max);
    if (normalizedValue < 0.3) return theme.colors.success;
    if (normalizedValue < 0.7) return theme.colors.warning;
    return theme.colors.error;
  };

  const rotation = animatedValue.interpolate({
    inputRange: [range.min, range.max],
    outputRange: ['-90deg', '90deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.gaugeContainer, { width: size, height: size }]}>
        {/* Background arc */}
        <View
          style={[
            styles.arc,
            {
              width: size,
              height: size / 2,
              borderColor: theme.colors.border,
              borderWidth: size / 20,
            },
          ]}
        />
        {/* Value arc */}
        <Animated.View
          style={[
            styles.arc,
            {
              width: size,
              height: size / 2,
              borderColor: getColor(value),
              borderWidth: size / 20,
              transform: [{ rotate: rotation }],
            },
          ]}
        />
        {/* Center circle */}
        <View
          style={[
            styles.centerCircle,
            {
              width: size / 10,
              height: size / 10,
              backgroundColor: getColor(value),
            },
          ]}
        />
      </View>
      <Text style={[styles.value, { color: theme.colors.text }]}>
        {value.toFixed(1)}
      </Text>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arc: {
    position: 'absolute',
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    transformOrigin: 'bottom',
  },
  centerCircle: {
    position: 'absolute',
    borderRadius: 1000,
    bottom: 0,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    marginTop: 5,
  },
}); 