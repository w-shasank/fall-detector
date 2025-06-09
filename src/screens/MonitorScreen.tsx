import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWebSocket } from '../contexts/WebSocketContext';

export const MonitorScreen = () => {
  const { isConnected, sensorData, error } = useWebSocket();

  const formatValue = (value: number | undefined) => {
    if (value === undefined) return '--';
    return value.toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Fall Detection Monitor</Text>
        
        <View style={styles.connectionStatus}>
          <Text style={[
            styles.statusText,
            { color: isConnected ? '#34C759' : '#FF3B30' }
          ]}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.sensorDataContainer}>
          <Text style={styles.sectionTitle}>Accelerometer Data</Text>
          <Text>X: {formatValue(sensorData?.accelerometer.x)}</Text>
          <Text>Y: {formatValue(sensorData?.accelerometer.y)}</Text>
          <Text>Z: {formatValue(sensorData?.accelerometer.z)}</Text>
        </View>

        <View style={styles.sensorDataContainer}>
          <Text style={styles.sectionTitle}>Gyroscope Data</Text>
          <Text>X: {formatValue(sensorData?.gyroscope.x)}</Text>
          <Text>Y: {formatValue(sensorData?.gyroscope.y)}</Text>
          <Text>Z: {formatValue(sensorData?.gyroscope.z)}</Text>
        </View>

        {sensorData && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>
              Last Update: {new Date(sensorData.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  connectionStatus: {
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 5,
  },
  sensorDataContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  timestampContainer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  timestamp: {
    color: '#666',
    fontSize: 14,
  },
}); 