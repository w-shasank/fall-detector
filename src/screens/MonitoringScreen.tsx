import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useSettings } from '../contexts/SettingsContext';
import { SensorGauge } from '../components/SensorGauge';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { Vector3D } from '../types';

const { width } = Dimensions.get('window');
const GAUGE_SIZE = width * 0.4;

const MOVEMENT_THRESHOLD = 0.5; // Threshold for movement detection
const MOVEMENT_CHECK_INTERVAL = 1000; // Check movement every second

export const MonitoringScreen: React.FC = () => {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const { isConnected, sensorData } = useWebSocket();
  const [isMoving, setIsMoving] = useState(false);
  const [movementColor] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();

  // Movement detection logic
  useEffect(() => {
    if (!sensorData) return;

    const checkMovement = () => {
      const { accelerometer, gyroscope } = sensorData;
      const totalAcceleration = Math.sqrt(
        Math.pow(accelerometer.x, 2) +
        Math.pow(accelerometer.y, 2) +
        Math.pow(accelerometer.z, 2)
      );
      const totalRotation = Math.sqrt(
        Math.pow(gyroscope.x, 2) +
        Math.pow(gyroscope.y, 2) +
        Math.pow(gyroscope.z, 2)
      );

      const newIsMoving = totalAcceleration > MOVEMENT_THRESHOLD || totalRotation > MOVEMENT_THRESHOLD;
      setIsMoving(newIsMoving);

      // Animate color change
      Animated.timing(movementColor, {
        toValue: newIsMoving ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    const interval = setInterval(checkMovement, MOVEMENT_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [sensorData]);

  const movementIndicatorColor = movementColor.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.success, theme.colors.warning],
  });

  const renderSensorGauges = (data: Vector3D, type: 'accelerometer' | 'gyroscope') => (
    <View style={styles.gaugeRow}>
      <SensorGauge
        value={data.x}
        label={`${type.charAt(0).toUpperCase()} X`}
        type={type}
        size={GAUGE_SIZE}
      />
      <SensorGauge
        value={data.y}
        label={`${type.charAt(0).toUpperCase()} Y`}
        type={type}
        size={GAUGE_SIZE}
      />
      <SensorGauge
        value={data.z}
        label={`${type.charAt(0).toUpperCase()} Z`}
        type={type}
        size={GAUGE_SIZE}
      />
    </View>
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        { paddingTop: insets.top }
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom }
      ]}
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
      <View style={styles.movementContainer}>
        <Animated.View
          style={[
            styles.movementIndicator,
            { backgroundColor: movementIndicatorColor },
          ]}
        />
        <Text style={[styles.movementText, { color: theme.colors.text }]}>
          {isMoving ? 'Moving' : 'Stationary'}
        </Text>
      </View>

      {/* Sensor Data */}
      <View style={styles.sensorContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Accelerometer
        </Text>
        {sensorData && renderSensorGauges(sensorData.accelerometer, 'accelerometer')}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Gyroscope
        </Text>
        {sensorData && renderSensorGauges(sensorData.gyroscope, 'gyroscope')}
      </View>
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
  },
  movementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  movementIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  movementText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sensorContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  gaugeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
}); 