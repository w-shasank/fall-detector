import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useWebSocket } from '../contexts/WebSocketContext';

export const ConnectionStatus: React.FC = () => {
  const { theme } = useTheme();
  const { isConnected, isConnecting, error } = useWebSocket();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isConnecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnecting]);

  const getStatusColor = () => {
    if (error) return theme.colors.error;
    if (isConnected) return theme.colors.success;
    if (isConnecting) return theme.colors.warning;
    return theme.colors.error;
  };

  const getStatusIcon = () => {
    if (error) return 'close-circle';
    if (isConnected) return 'checkmark-circle';
    if (isConnecting) return 'sync';
    return 'close-circle';
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    if (isConnected) return 'Connected';
    if (isConnecting) return 'Connecting...';
    return 'Disconnected';
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor: getStatusColor(),
          },
        ]}
      >
        <Ionicons
          name={getStatusIcon()}
          size={24}
          color={theme.colors.background}
        />
      </Animated.View>
      <Text style={[styles.statusText, { color: theme.colors.text }]}>
        {getStatusText()}
      </Text>
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
  },
}); 