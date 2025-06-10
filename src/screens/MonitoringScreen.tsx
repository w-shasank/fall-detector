import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useSettings } from '../contexts/SettingsContext';
import { SensorGauge } from '../components/SensorGauge';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { SensorData } from '../types';

const MOVEMENT_THRESHOLD = 0.5; // Threshold for movement detection
const UPDATE_INTERVAL = 100; // ms

export const MonitoringScreen: React.FC = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { sensorData, isConnected } = useWebSocket();
  const { settings } = useSettings();
  
  const [isMoving, setIsMoving] = useState(false);
  const [fallDetected, setFallDetected] = useState(false);
  const movementAnim = new Animated.Value(0);

  // Calculate gauge size based on screen width
  const gaugeSize = Math.min(width * 0.4, 150);

  // Movement detection
  useEffect(() => {
    if (!sensorData) return;

    const checkMovement = () => {
      const { accelerometer, gyroscope } = sensorData;
      const accelMagnitude = Math.sqrt(
        accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2
      );
      const gyroMagnitude = Math.sqrt(
        gyroscope.x ** 2 + gyroscope.y ** 2 + gyroscope.z ** 2
      );

      const newIsMoving = accelMagnitude > MOVEMENT_THRESHOLD || gyroMagnitude > MOVEMENT_THRESHOLD;
      setIsMoving(newIsMoving);

      // Animate movement indicator
      Animated.spring(movementAnim, {
        toValue: newIsMoving ? 1 : 0,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();
    };

    const interval = setInterval(checkMovement, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [sensorData]);

  // Fall detection
  useEffect(() => {
    if (!sensorData) return;

    const { accelerometer, gyroscope } = sensorData;
    const accelMagnitude = Math.sqrt(
      accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2
    );
    const gyroMagnitude = Math.sqrt(
      gyroscope.x ** 2 + gyroscope.y ** 2 + gyroscope.z ** 2
    );

    const isFall = 
      accelMagnitude > settings.fallDetectionConfig.accelerometerThreshold ||
      gyroMagnitude > settings.fallDetectionConfig.gyroscopeThreshold;

    setFallDetected(isFall);
  }, [sensorData, settings.fallDetectionConfig]);

  const renderSensorGauges = () => {
    if (!sensorData) return null;

    return (
      <View style={styles.gaugesContainer}>
        <View style={styles.gaugeRow}>
          <SensorGauge
            value={sensorData.accelerometer.x}
            label="Accel X"
            type="accelerometer"
            size={gaugeSize}
          />
          <SensorGauge
            value={sensorData.accelerometer.y}
            label="Accel Y"
            type="accelerometer"
            size={gaugeSize}
          />
          <SensorGauge
            value={sensorData.accelerometer.z}
            label="Accel Z"
            type="accelerometer"
            size={gaugeSize}
          />
        </View>
        <View style={styles.gaugeRow}>
          <SensorGauge
            value={sensorData.gyroscope.x}
            label="Gyro X"
            type="gyroscope"
            size={gaugeSize}
          />
          <SensorGauge
            value={sensorData.gyroscope.y}
            label="Gyro Y"
            type="gyroscope"
            size={gaugeSize}
          />
          <SensorGauge
            value={sensorData.gyroscope.z}
            label="Gyro Z"
            type="gyroscope"
            size={gaugeSize}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Connection Status */}
      <View style={styles.header}>
        <ConnectionStatus />
        {isConnected && (
          <Text style={[styles.serverUrl, { color: theme.colors.textSecondary }]}>
            {settings.serverUrl}
          </Text>
        )}
      </View>

      {/* Movement Status */}
      <Animated.View
        style={[
          styles.movementIndicator,
          {
            backgroundColor: theme.colors.surface,
            transform: [
              {
                scale: movementAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[styles.movementText, { color: theme.colors.text }]}>
          {isMoving ? 'Moving' : 'Stationary'}
        </Text>
      </Animated.View>

      {/* Fall Detection Status */}
      <View
        style={[
          styles.fallDetectionStatus,
          {
            backgroundColor: fallDetected
              ? theme.colors.error
              : theme.colors.success,
          },
        ]}
      >
        <Text style={[styles.fallDetectionText, { color: theme.colors.background }]}>
          {fallDetected ? 'Fall Detected!' : 'Normal'}
        </Text>
      </View>

      {/* Sensor Gauges */}
      {renderSensorGauges()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serverUrl: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  movementIndicator: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  movementText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  fallDetectionStatus: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  fallDetectionText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gaugesContainer: {
    gap: 24,
  },
  gaugeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
  },
}); 